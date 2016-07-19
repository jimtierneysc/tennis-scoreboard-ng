# Model for a tennis match
# A match may be a singles match or a doubles match.
# A match has two opponent teams.  The teams may be doubles teams, or
# singles teams (a singles team has only one player).
# A match may be in different states: not started, in progress, finished
# and complete.
# Finished and complete matches both have a winner.
# A match is complete after the scorer has confirmed the final score.
# A match that has started has sets.  Each set has games.
# A match that has started has first servers.  For a singles match, there is one
# first server; two for a doubles match.
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

  # Change state of match by an action
  # Valid actions:
  # :start_play - Start match
  # :restart_play - Restart match
  # :discard_play - Discard all scoring
  # :complete_play - Complete match
  # :start_set
  # :complete_set_play
  # :start_game
  # :start_tiebreaker - Start game tiebreaker
  # :remove_last_change - Undo
  # :start_match_tiebreaker
  # :complete_match_tiebreaker
  # :win_game
  # :win_tiebreaker
  # :win_match_tiebreaker

  def play_match!(action, param = nil)
    method = lookup_exec_methods(action, param)
    if method
      if param
        method[:exec].call(param)
      else
        method[:exec].call
      end
    else
      raise Exceptions::UnknownOperation, "Unknown action: #{action}"
    end
  end

  # Can state can be changed by an action?
  def play_match? action
    methods = lookup_methods(action)
    if methods
      methods[:query].call
    else
      raise Exceptions::UnknownOperation, "Unknown action: #{action}"
    end
  end

  # Return hash of valid actions, for example {start_game: true}
  def play_actions
    result = {}
    methods_table.each do |k, v|
      if v[:query].call
        result[k] = true
      end
    end
    result
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
    elsif compute_team_winner
      :finished
    elsif started
      :in_progress
    else
      :not_started
    end
  end

  # return the winner of the match, if any
  def compute_team_winner
    if first_team && second_team
      if sets_won(first_team) == min_sets_to_play
        first_team
      elsif sets_won(second_team) == min_sets_to_play
        second_team
      end
    end
  end

  def sets_won(team)
    match_sets.reduce(0) do |sum, set|
      winner = set.compute_team_winner
      sum + (winner && (winner.id == team || winner == team) ? 1 : 0)
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

  def next_player_server
    player_server_helper.next_player_server
  end

  def tiebreaker_set?(ordinal)
    scoring_of_set_ordinal(ordinal) == :ten_point
  end

  def team_of_player(player)
    player_server_helper.team_of_player player
  end

  private

  # Operations to change the score of a match.
  #
  # Use these methods to start a match, start a set, start a game,
  # win a game, etc. The methods operate on the match at the current point.
  # For example, win_game! applies to the current game in progress.  If a method
  # is called out of sequence, an exception is raised. Use the "?" methods
  # to determine if an operation is allowed.  For example, use win_game?
  # before calling win_game!.
  #
  # To maintain the integrity of a match, do not use other models or methods to
  # modify the score of a match. For example, do not use MatchSets to add a
  # set. Instead use Match.#start_set!.
  #
  # These methods are responsible for changing and saving entities.
  # An exception will be raised if any errors occur.

  # Starts the match.  Creates the first set.
  def start_play?
    !started
  end

  def start_play!
    ActiveRecord::Base.transaction do
      unless start_play?
        raise Exceptions::InvalidOperation, 'Can\'t start play'
      end
      update_start_play!
    end
    self
  end

  # Starts a new set.  NOP if called immediately after start_play
  def start_set?
    start_next_helper.start_set?
  end

  def start_set!
    ActiveRecord::Base.transaction do
      unless start_set?
        raise Exceptions::InvalidOperation,
              "Can\'t start set #{match_sets.count}"
      end
      update_start_set!
    end
  end

  # Start a new game.  A game will be added to the current set.
  # The server will be computed and assigned to the game.
  def start_game?
    start_next_helper.start_game?
  end

  def start_game! player_server = nil
    ActiveRecord::Base.transaction do
      if player_server
        update_first_or_second_player_server!(player_server)
      end
      update_start_game!
    end
  end

  def win_game?
    complete_current_helper.win_game?
  end

  def win_game!(team)
    ActiveRecord::Base.transaction do
      unless win_game?
        raise Exceptions::InvalidOperation,
              "Can\'t win game #{last_set ? last_set.set_games.count : 0}"
      end
      game = complete_current_helper.win_game team
      game.save!
      game
    end
  end

  # Start a tiebreaker at the end of a set.
  def start_tiebreaker?
    start_next_helper.start_tiebreaker?
  end

  def start_tiebreaker!
    ActiveRecord::Base.transaction do
      unless start_tiebreaker?
        raise Exceptions::InvalidOperation, 'can\'t start tiebreaker'
      end
      game = start_next_helper.start_tiebreaker
      game.save!
      game
    end
  end

  # Win a tiebreaker.  The winning team must be provided.
  def win_tiebreaker?
    complete_current_helper.win_tiebreaker?
  end

  def win_tiebreaker!(team)
    ActiveRecord::Base.transaction do
      unless win_tiebreaker?
        raise Exceptions::InvalidOperation, 'can\'t win tiebreaker'
      end
      game = complete_current_helper.win_tiebreaker team
      game.save!
      game
    end
  end

  # Complete a set.  A set can be completed once a player has won the set.
  def complete_set_play?
    complete_current_helper.complete_set?
  end

  def complete_set_play!
    ActiveRecord::Base.transaction do
      unless complete_set_play?
        raise Exceptions::InvalidOperation,
              "Can\'t complete set #{match_sets.count}"
      end
      last_set_var = last_set
      last_set_var.team_winner = last_set_var.compute_team_winner
      last_set_var.save!
    end
  end

  # Start a match tiebreaker.  A match tiebreaker can be
  # created after each player has won an equal number of sets.
  def start_match_tiebreaker?
    start_next_helper.start_match_tiebreaker?
  end

  def start_match_tiebreaker!
    ActiveRecord::Base.transaction do
      unless start_match_tiebreaker?
        raise Exceptions::InvalidOperation, 'Can\'t start match tiebreaker'
      end
      set = create_new_set
      set.save!
      game = start_next_helper.start_tiebreaker
      game.save!
    end
  end

  # Win the match tiebreaker.
  def win_match_tiebreaker?
    complete_current_helper.win_match_tiebreaker?
  end

  def win_match_tiebreaker!(team)
    ActiveRecord::Base.transaction do
      unless win_match_tiebreaker?
        raise Exceptions::InvalidOperation, 'Can\'t win match tiebreaker'
      end
      game = complete_current_helper.win_match_tiebreaker team
      game.save!
      game
    end
  end

  # Complete match tiebreaker.
  def complete_match_tiebreaker?
    complete_current_helper.complete_match_tiebreaker?
  end

  def complete_match_tiebreaker!
    ActiveRecord::Base.transaction do
      unless complete_match_tiebreaker?
        raise Exceptions::InvalidOperation, 'Can\'t complete match tiebreaker'
      end
      last_set_var = last_set
      last_set_var.team_winner = last_set_var.compute_team_winner
      last_set_var.save!
    end
  end

  # Complete the match.
  def complete_play?
    if compute_team_winner && !completed?
      if match_sets.count > 1
        # If multiple sets, then last set must be in complete state
        last_set.completed?
      else
        # If only one set then don't make user complete it.  Can just
        # complete match.
        true
      end
    end
  end

  def complete_play!
    unless completed?
      ActiveRecord::Base.transaction do
        unless complete_play?
          raise Exceptions::InvalidOperation, 'Can\'t complete play'
        end
        update_complete_play!
      end
    end
  end

  # Discard all of the match scoring.
  def discard_play?
    started
  end

  def discard_play!
    ActiveRecord::Base.transaction do
      unless discard_play?
        raise Exceptions::InvalidOperation, 'Can\'t discard play'
      end
      update_discard_play!
    end
  end

  # Return match to state after match started.
  def restart_play!
    ActiveRecord::Base.transaction do
      unless restart_play?
        raise Exceptions::InvalidOperation, 'Can\'t restart play'
      end
      update_discard_play!
      update_start_play!
    end
  end

  def restart_play?
    started
  end

  # Back out one scoring operation.
  def remove_last_change!
    ActiveRecord::Base.transaction do
      unless remove_last_change?
        raise Exceptions::InvalidOperation, 'Can\'t remove last change'
      end
      helper = RemoveLastScoringChange.new(self)
      helper.save_list.each(&:save!)
      helper.destroy_list.each(&:destroy)
    end
  end

  def remove_last_change?
    started
  end

  def methods_table
    unless @methods
      @methods = {}
      syms = [:start_play, :restart_play,
              :discard_play, :complete_play, :start_set,
              :complete_set_play, :start_game, :start_tiebreaker, :remove_last_change,
              :start_match_tiebreaker, :complete_match_tiebreaker,
              :win_game, :win_tiebreaker, :win_match_tiebreaker]
      syms.each do |sym|
        @methods[sym] =
          {
            param: nil,
            exec: method("#{sym}!"),
            query: method("#{sym}?")
          }
      end

      syms = [:win_game, :win_tiebreaker, :win_match_tiebreaker]
      syms.each do |sym|
        @methods[sym][:param] = :required
      end
      @methods[:start_game][:param] = :optional
    end
    @methods
  end

  def lookup_exec_methods(action, param)
    result = lookup_methods action
    if result
      unless param.nil? == result[:param].nil? || result[:param] == :optional
        result = nil
      end
    end
    result
  end

  def lookup_methods(action)
    action = action.to_sym
    result = methods_table[action] if methods_table.has_key? action
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

  def singles_player_of_team(team)
    raise Exceptions::InvalidOperation, 'singles expected' if doubles
    team.first_player if team
  end

  def singles_player_team(player)
    raise Exceptions::InvalidOperation, 'singles expected' if doubles
    player.singles_team! if player # force a team
  end

  def create_new_set
    ordinal = match_sets.count + 1
    set = MatchSet.new(match_id: id,
                       ordinal: ordinal,
                       scoring: scoring_of_set_ordinal(ordinal))
    match_sets << set
    set # fluent
  end

  def update_discard_play!
    match_sets.destroy_all
    self.first_player_server = nil
    self.second_player_server = nil
    self.started = false
    self.team_winner = nil
    save!
  end

  def update_start_set!
    set = create_new_set
    set.save!
  end

  def update_start_play!
    self.started = true
    save!
    set = create_new_set
    set.save!
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

  def update_first_or_second_player_server!(player)
    raise Exceptions::InvalidOperation, 'Player required' unless player
    raise Exceptions::InvalidOperation, 'Invalid type' unless player.is_a? Player
    if first_player_server.nil?
      self.first_player_server = player
      save!
    elsif second_player_server.nil?
      self.second_player_server = player
      save!
    end
  end

  def update_start_game!
    unless start_game?
      raise Exceptions::InvalidOperation,
            "can\'t start game #{last_set ? last_set.set_games.count : 0}"
    end
    game = start_next_helper.start_game
    game.save!
    game
  end

  def update_complete_play!
    if min_sets_to_play == 1
      last_set_var = last_set
      last_set_var.team_winner = last_set_var.compute_team_winner
      last_set_var.save!
    end
    self.team_winner = compute_team_winner
    save!
  end

  def player_server_helper
    @player_servers_helper ||= PlayerServersHelper.new(self)
  end

  def start_next_helper
    @start_next_helper ||= StartNext.new(self)
  end

  def complete_current_helper
    @complete_current_helper ||= CompleteCurrent.new(self)
  end

  include MatchPlayHelpers
end
