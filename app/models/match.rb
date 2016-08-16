# Model for a tennis match
#
# A match may be a singles match or a doubles match.
#
# A match has two opponent teams.  The teams may be doubles teams, or
# singles teams (a singles team has only one player).
#
# A match may be in different states: not started, in progress,
# and complete. Complete matches have a winner.
#
# A match may have first servers.  These are the players that server
# the first game or two.  For a singles match, there is one
# first server; two for a doubles match.
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

  # play_match!
  #
  # === action
  # :start_play
  #   Start playing
  # :restart_play
  #   Discard all scoring and start playing
  # :discard_play
  #   Discard all scoring
  # :start_set
  #   Start the next set
  # :start_game [player]
  #   Start the next game.  The first one or two games require
  #   a player parameter to identify the server
  # :start_tiebreaker
  #   Start game tiebreaker
  # :remove_last_change
  #   Back up to the previous state
  # :start_match_tiebreaker
  #   Start the match tiebreaker
  # :win_game team
  #   Win the current game.  A team parameter identies the
  #   doubles team or singles team to win
  # :win_tiebreaker
  #   Win the current set tiebreaker.  A team parameter identies the
  #   doubles team or singles team to win
  # :win_match_tiebreaker
  #   Win the current match tiebreaker.  A team parameter identies the
  #   doubles team or singles team to win
  # === Options
  # [:version]
  #   Version number from client.  If provided, it will be compared to the
  #   current match play version number.  An exception may be
  #   raised if not equal.
  # [:player]
  #   Player parameter. Used by :win_* actions and by :start_game
  # :team
  #   Team parameter.  Used by :win_* actions.
  # :opponent
  #   Team or player.  Used by :win_* actions.   Convenient alternative to
  #   :team or :player options.
  #

  def play_match!(action, options = nil)
    method = play_methods.lookup_method(action)
    if method
      ActiveRecord::Base.transaction do
        version = options[:version] if options
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
        method[:exec].call options
        # Version number is used to detect when client has is out of sync
        self.play_version = next_version_number
        self.save!
      end
    else
      raise Exceptions::UnknownOperation, "Unknown action: #{action}"
    end
  end

  # Can action be applied?
  def play_match? action
    methods = play_methods.lookup_method(action)
    if methods
      methods[:query].call
    else
      raise Exceptions::UnknownOperation, "Unknown action: #{action}"
    end
  end

  # Return hash of valid actions, for example {start_game: true}
  def play_actions
    play_methods.valid_actions
  end

  # Retrieve information about the match

  def completed?
    team_winner
  end

  # The opponents in a match are teams.  For singles matches,
  # each team has a single player.
  def first_player
    singles_player_of_team first_team
  end

  def first_player=(player)
    self.first_team = singles_player_team(player)
  end

  def second_player
    singles_player_of_team second_team
  end

  def second_player=(player)
    self.second_team = singles_player_team(player)
  end

  def state
    if completed?
      :complete
    elsif started
      :in_progress
    else
      :not_started
    end
  end

  def sets_won(team)
    match_sets.reduce(0) do |sum, set|
      winner = set.compute_team_winner
      sum + (winner && winner == team ? 1 : 0)
    end
  end

  def first_set
    match_sets.first
  end

  def last_set
    match_sets.last
  end

  def min_sets_to_play
    max = max_sets_to_play
    raise Exceptions::ApplicationError, 'Unexpected game count' if max.even?
    (max + 1) / 2
  end

  def max_sets_to_play
    case scoring.to_sym
    when :two_six_game_ten_point
      3
    when :one_eight_game
      1
    when :three_six_game
      3
    end
  end

  def next_game_ordinal
    last_set ? last_set.set_games.count + 1 : 0
  end

  def tiebreaker_set?(ordinal)
    scoring_of_set_ordinal(ordinal) == :ten_point
  end

  # return the winner of the match, if any
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

  def near_team_winner? team
    unless completed?
      sets_won(team) + 1 == min_sets_to_play
    end
  end

  def scoring_of_set_ordinal(ordinal)
    case scoring.to_sym
    when :two_six_game_ten_point
      ordinal == 3 ? :ten_point : :six_game
    when :one_eight_game
      :eight_game
    when :three_six_game
      :six_game
    end
  end

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

  # Get an increasing number to use as a version number for a match score
  def next_version_number
    # This returns a PGresult object
    # [http://rubydoc.info/github/ged/ruby-pg/master/PGresult]
    result = Match.connection.execute("SELECT nextval('play_version_seq')")
    result[0]['nextval']
  end

  def play_methods
    @play_methods ||= PlayMethods.new(self)
  end

  include MatchPlayHelpers
end
