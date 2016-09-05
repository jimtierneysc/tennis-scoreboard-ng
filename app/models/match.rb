# Model for a tennis match
# == Overview
# * A match may be a singles match or a doubles match
# * A match has two opponent teams:
#   * Doubles teams with four players in total
#   * Singles teams with two players in total
# * A match has a state:
#   * +:not_started+
#   * +:in_progress+
#   * +:complete+
# * A match may have first servers
# First server are the players that serve
# the first game or two.  For a singles match, there is a
# first server for the first game.  For a doubles match, there is a first
# server for the first two games; one from each team.
# * A match has sets (see MatchSet).  Sets have games (see SetGame).
# * A match has scoring:
#   * +:two_six_game_ten_point+
#   * +:one_eight_game+
#   * +:three_six_game+
# * A complete match has a winner
#
# == Schema Information
#
# Table name: matches
#
#  id                      :integer          not null, primary key
#  created_at              :datetime         not null
#  updated_at              :datetime         not null
#  first_team_id           :integer          not null
#  second_team_id          :integer          not null
#  scoring                 :string           not null
#  started                 :boolean          default(FALSE), not null
#  doubles                 :boolean          default(FALSE), not null
#  first_player_server_id  :integer
#  second_player_server_id :integer
#  title                   :string
#  team_winner_id          :integer
#  play_version            :integer
#
class Match < ActiveRecord::Base
  belongs_to :first_player_server,
             class_name: 'Player', foreign_key: :first_player_server_id
  belongs_to :second_player_server,
             class_name: 'Player', foreign_key: :second_player_server_id
  belongs_to :first_team, class_name: 'Team', foreign_key: :first_team_id
  belongs_to :second_team, class_name: 'Team', foreign_key: :second_team_id
  belongs_to :team_winner, class_name: 'Team', foreign_key: :team_winner_id
  has_many :match_sets, dependent: :destroy
  has_many :set_games, through: :match_sets

  # Store nil instead of "".  The schema does not allow duplicate titles,
  # including duplicate ""
  before_validation { self.title = nil if self.title.blank? }
  # If a title is not provided when match is created, generate one
  before_create { self.title = next_match_title if self.title.blank? }

  # Some of these rules mimic constraints in the schema
  validates :scoring, presence: true # schema
  validates_uniqueness_of :title, allow_nil: true # schema
  validate do
    ValidationHelper.new(self).validate(errors)
  end

  # Execute an action on the match, such as +:win_game+
  #
  # * *Args*    :
  #   - +action+ -> the action to execute
  #   - +params+ -> hash of action parameters
  # * *Raises* :
  #   - +UnknownOperation+ -> if the action is unknown
  #   - +InvalidOperation+ -> if the action is not permitted
  #
  # === Action
  # * +:start_play+ - Start playing
  # * +:discard_play+ - Discard all scoring
  # * +:start_set+ - Start the next set
  # * +:start_game+ - Start the next game
  # When starting the first game in a singles match, or the first
  # two games in a doubles match, +params+ identifies the player to
  # serve the game.
  # * +:start_tiebreak+ - Start game tiebreak
  # * +:remove_last_change+ - Back up to the previous state
  # * +:start_match_tiebreak+ - Start the match tiebreak
  # * +:win_game+ - Win the current game
  # * +:win_tiebreak+ - Win the current set tiebreak.
  # * +:win_match_tiebreak+ - Win the current match tiebreak.
  # For the 3 +:win_*+ actions, +params+ identifies the
  # doubles team or singles team to win
  # === Params
  # * +:version+ Version number from client.
  # If provided, it will be compared to the
  # current match play version number.  An exception will be
  # raised if the values are not equal.  The purpose of the version
  # number is to detect when a client is out of sync.
  # * +:opponent+ - Team or Player
  # This options is used with +:win_*+ actions to identify the winning team or player.  It is also
  # used with the +:start_game+ action to identify the serving player
  #
  def play_match!(action, params = nil)
    method = play_actions.lookup_method(action)
    if method
      ActiveRecord::Base.transaction do
        version = params[:version] if params
        version = version.to_i if version
        if version && version != self.play_version
          raise Exceptions::InvalidOperation,
                "Unable to #{action.to_s.tr('_', ' ')}. " +
                  if version < self.play_version
                    'Client is out of sync.'
                  else
                    'Unexpected match version number.'
                  end
        end
        method[:exec].call params
        # Version number is used to detect when client has is out of sync
        self.play_version = next_version_number
        self.save!
      end
    else
      raise Exceptions::UnknownOperation, "Unknown action: #{action}"
    end
  end

  # Indicate if an action can be executed.
  # +:win_game+ can be executed if a game has started, for example.
  def play_match?(action)
    methods = play_actions.lookup_method(action)
    if methods
      methods[:query].call
    else
      raise Exceptions::UnknownOperation, "Unknown action: #{action}"
    end
  end

  # Generate a hash of valid actions
  # * *Returns* : Hash
  # === Example
  #   {
  #     start_game: true,
  #     discard_play: true,
  #     remove_last_change: true
  #   }
  def valid_actions
    play_actions.valid_actions
  end

  # Indicate if the match is completed.
  def completed?
    team_winner
  end

  # Get the first player opponent in a singles match
  # * *Returns* : Player
  def first_player
    singles_player_of_team first_team
  end

  # Set the first player opponent in a singles match.
  # A new team may be created to hold the player
  def first_player=(player)
    self.first_team = singles_player_team(player)
  end

  # Get the second player opponent in a singles match
  # * *Returns* : Player
  def second_player
    singles_player_of_team second_team
  end

  # Set the second player opponent in a singles match.
  # A new team may be created to hold the player
  def second_player=(player)
    self.second_team = singles_player_team(player)
  end

  # Get the state of the match
  # * :complete
  # * :in_progress
  # * :not_started
  def state
    if completed?
      :complete
    elsif started
      :in_progress
    else
      :not_started
    end
  end

  # Calculate the number of sets won by a team
  #
  # * *Args*    :
  #   - +team+ -> Team
  # * *Returns* : Integer
  def sets_won(team)
    match_sets.reduce(0) do |sum, set|
      winner = set.compute_team_winner
      sum + (winner && winner == team ? 1 : 0)
    end
  end

  # Get the first set of the match
  # * *Returns* : MatchSet
  def first_set
    match_sets.first
  end

  # Get the last set of the match
  # * *Returns* : MatchSet
  def last_set
    match_sets.last
  end

  # Get the minimum number of sets that will be played in this match
  # The minimum is 2 for +:three_six_game+ scoring, for example
  # * *Returns* : Integer
  def min_sets_to_play
    max = max_sets_to_play
    raise Exceptions::ApplicationError, 'Unexpected game count' if max.even?
    (max + 1) / 2
  end

  # Get the maximum number of sets that will be played in this match.
  # The maximum is 3 for +:three_six_game+ scoring, for example
  # * *Returns* : Integer
  def max_sets_to_play
    case scoring.to_sym
    when :two_six_game_ten_point
      3
    when :one_eight_game
      1
    else # :three_six_game
      3
    end
  end

  # Get the ordinal of the next game to play in the
  # match. The lowest ordinal is 1.
  # * *Returns* : Integer
  def next_game_ordinal
    last_set ? last_set.set_games.count + 1 : 0
  end

  # Indicate whether a set is a match tiebreak
  # * *Args*    :
  #   - +ordinal+ -> Integer
  # * *Returns* : Boolean
  def tiebreak_set?(ordinal)
    scoring_of_set(ordinal) == :ten_point
  end

  # Compute the winner of the match based on
  # the number of sets won by each opponent
  # * *Returns* : Team or nil
  def compute_team_winner
    if completed?
      team_winner
    else
      if first_team && second_team
        if sets_won(first_team) == min_sets_to_play
          first_team
        elsif sets_won(second_team) == min_sets_to_play
          second_team
        end
      end
    end
  end

  # Determine whether a Team can win the match by
  # winning one more game
  # * *Args*    :
  #   - +team+ -> Team
  # * *Returns* : Boolean
  def near_team_winner?(team)
    unless completed?
      sets_won(team) + 1 == min_sets_to_play
    end
  end

  # Get the scoring of a set
  # * *Args*    :
  #   - +ordinal+ -> set ordinal
  # * *Returns* : symbol
  #   * +:six_game+
  #   * +:eight_game+
  #   * +:ten_point+  (tiebreak)
  def scoring_of_set(ordinal)
    case scoring.to_sym
    when :two_six_game_ten_point
      ordinal == 3 ? :ten_point : :six_game
    when :one_eight_game
      :eight_game
    else # :three_six_game
      :six_game
    end
  end

  # Get the opponent team that includes a particular player
  # * *Args*    :
  #   - +player+ -> Player
  # * *Returns* : Team
  def team_of_player(player)
    if player
      if first_team.include_player?(player)
        first_team
      elsif second_team.include_player?(player)
        second_team
      end
    end
  end

  private

  def singles_player_of_team(team)
    raise Exceptions::InvalidOperation, 'singles expected' if doubles
    team.first_player if team && !team.doubles
  end

  def singles_player_team(player)
    raise Exceptions::InvalidOperation, 'singles expected' if doubles
    player.singles_team! if player # force a team
  end

  # Generate a unique title for a match
  def next_match_title
    "Match#{next_match_number}"
  end

  # Get a unique number to use when generating a match title
  def next_match_number
    # This returns a PGresult object
    # [http://rubydoc.info/github/ged/ruby-pg/master/PGresult]
    result = Match.connection.execute("SELECT nextval('match_number_seq')")
    result[0]['nextval']
  end

  # A Postgres sequence generates a version number for a match score
  def next_version_number
    # This returns a PGresult object
    # [http://rubydoc.info/github/ged/ruby-pg/master/PGresult]
    result = Match.connection.execute("SELECT nextval('play_version_seq')")
    result[0]['nextval']
  end

  def play_actions
    @play_actions ||= PlayActions.new(self)
  end

  include MatchPlay
  include MatchValidation
end
