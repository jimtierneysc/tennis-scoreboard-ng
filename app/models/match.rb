# Model for a tennis match
# A match may be a singles match or a doubles match.
# A match has two opponent teams.  The teams may be doubles teams, or
# a teams with only one player.
# A match may be in different states: not started, in progress, finished
# and complete.
# Finished and complete matches both have a winner.
# A match is complete after the scorer has confirmed the final score.
# A match that has started has sets.  Each set has games.
# A match that has started has first first servers.  These are players
# that serve in the first game(s).  For a singles match, there is one
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
  # If a title is not provided when match is created, generate
  # one (as convenience for user)
  before_create { self.title = next_match_title if self.title.blank? }

  # Some of these rules mimic constraints in the schema
  validates :scoring, presence: true # schema
  validates_uniqueness_of :title, allow_nil: true # schema
  validate do
    ValidationHelper.new(self).validate(errors)
  end

  # Change score by an action, for example :start_next_game
  # Valid actions:
  # :start_play - Start match
  # :restart_play - Restart match
  # :discard_play - Discard all scoring
  # :complete_play - Complete match
  # :start_next_set
  # :complete_set_play
  # :start_next_game
  # :start_tiebreaker - Start game tiebreaker
  # :remove_last_change - Undo
  # :start_match_tiebreaker
  # :complete_match_tiebreaker
  # :win_game
  # :win_tiebreaker
  # :win_match_tiebreaker

  def change_score!(action, param = nil)
    method = lookup_exec_methods(action, param)
    if method
      if param
        method[:exec].call(param)
      else
        method[:exec].call
      end
    else
      raise Exceptions::InvalidOperation, "Unknown action: #{action}"
    end
  end

  # Can score can be changed by an action?
  def change_score? action
    methods = lookup_methods(action)
    if methods
      methods[:query].call
    else
      raise Exceptions::InvalidOperation, "Unknown action: #{action}"
    end
  end

  # Hash of valid actions, for example {start_next_game: true}
  def score_actions
    result = {}
    methods_table.each do |k, v|
      if v[:query].call
        result[k] = true
      end
    end
    result
  end

  # This method may be used by a controller to start the next game.
  # It captures errors rather than raise an exception
  def validate_start_next_game_with_server(player)
    if player.nil?
      errors.add(:player_server, 'must be specified')
    else
      begin
        start_next_game_with_server!(player)
      rescue
        errors.add(:root, 'Operation could not be completed')
      end
    end
    errors.count == 0
  end

  # If the first server is already specified, set the second server
  def apply_first_or_second_player_server(player)
    if player
      ActiveRecord::Base.transaction do
        update_first_or_second_player_server! player
      end
    end
  end


  # Retrieve information about the match

  def completed?
    team_winner
  end

  # The opponents in a match are teams.  For singles matches,
  # each team has a single player.
  def first_singles_player
    singles_player_of_team first_team
  end

  def first_singles_player=(player)
    self.first_team = singles_player_team(player)
  end

  def second_singles_player
    singles_player_of_team second_team
  end

  def second_singles_player=(player)
    self.second_team = singles_player_team(player)
  end

  def teams
    [first_team, second_team]
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

  def match_score(team)
    if min_sets_to_play > 1
      sets_won(team)
    else
      last_set ? last_set.games_won(team) : 0
    end
  end

  def players
    players_var = []
    first_team.players.each { |p| players_var << p } if first_team
    second_team.players.each { |p| players_var << p } if second_team
    players_var
  end

  def first_set
    match_sets.first
  end

  def last_set
    match_sets.last
  end

  def last_game
    last_set.last_game if last_set
  end

  def player_serving
    if state == :in_progress
      last_game_var = last_game
      last_game_var.player_server if last_game_var && !last_game_var.tiebreaker?
    end
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
    else
      raise ArgumentError, "Unknown scoring: #{scoring}"
    end
  end

  def first_servers_provided?
    player_server_helper.first_servers_provided?
  end

  def next_game_ordinal
    last_set ? last_set.set_games.count + 1 : 0
  end

  def players_that_may_serve_first
    player_server_helper.players_that_may_serve_first
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
  # set. Instead use Match.#start_next_set!.
  #
  # These methods are responsible for changing and saving entities.
  # An exception will be raised if any errors occur when changing or saving
  # the match.  The convention is to end the method name with "!", when the
  # mathod may raise an exception.

  # Starts the match.  Creates the first set.
  def start_play?
    !started
  end

  def start_play!
    unless started
      ActiveRecord::Base.transaction do
        update_start_play!
      end
    end
    self
  end

  # Starts a new set.  NOP if called immediately after start_play
  def start_next_set?
    start_next_helper.start_next_set?
  end

  def start_next_set!
    if last_set && last_set.completed?
      ActiveRecord::Base.transaction do
        unless start_next_set?
          raise Exceptions::InvalidOperation, 'Can\'t start next set'
        end
        update_start_next_set!
      end
    end
  end

  # Start a new game.  A game will be added to the current set.
  # The server will be computed and assigned to the game.
  def start_next_game?
    start_next_helper.start_next_game?
  end

  def start_next_game! player_server = nil
    ActiveRecord::Base.transaction do
      if player_server
        update_first_or_second_player_server!(player_server)
      end
      update_start_next_game!
    end
  end

  # def start_next_game_with_server!(player)
  #   ActiveRecord::Base.transaction do
  #     update_first_or_second_player_server!(player)
  #     update_start_next_game!
  #   end
  # end

  def win_game?
    complete_current_helper.win_game?
  end

  def win_game!(team)
    ActiveRecord::Base.transaction do
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
        raise Exceptions::InvalidOperation, 'can\'t complete set'
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
        raise Exceptions::InvalidOperation, 'can\'t win match tiebreaker'
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
        raise Exceptions::InvalidOperation, 'can\'t complete match tiebreaker'
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
    if started
      ActiveRecord::Base.transaction do
        update_discard_play!
      end
    end
  end

  # Return match to state after match started.
  def restart_play!
    ActiveRecord::Base.transaction do
      update_discard_play!
      update_start_play!
    end
  end

  def restart_play?
    true
  end

  # Back out one scoring operation.
  def remove_last_change!
    ActiveRecord::Base.transaction do
      helper = RemoveLastScoringChangeHelper.new(self)
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
              :discard_play, :complete_play, :start_next_set,
              :complete_set_play, :start_next_game, :start_tiebreaker, :remove_last_change,
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
      @methods[:start_next_game][:param] = :optional
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

  def player_server_helper
    @player_servers_helper ||= PlayerServersHelper.new(self)
    @player_servers_helper
  end

  def start_next_helper
    @start_next_helper ||= StartNextHelper.new(self)
    @start_next_helper
  end

  def complete_current_helper
    @complete_current_helper ||= CompleteCurrentHelper.new(self)
    @complete_current_helper
  end

  def scoring_of_set_ordinal(ordinal)
    case scoring.to_sym
    when :two_six_game_ten_point
      ordinal == 3 ? :ten_point : :six_game
    when :one_eight_game
      :eight_game
    when :three_six_game
      :six_game
    else
      raise ArgumentError, "Unknown scoring: #{scoring}"
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

  def update_start_next_set!
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
    if first_player_server.nil?
      self.first_player_server = player
      save!
    elsif second_player_server.nil?
      self.second_player_server = player
      save!
    end
  end

  def update_start_next_game!
    unless start_next_game?
      raise Exceptions::InvalidOperation, 'can\'t start next game'
    end
    game = start_next_helper.start_next_game
    game.save!
    game
  end

  def update_complete_play!
    if match_sets.count == 1
      last_set_var = last_set
      last_set_var.team_winner = last_set_var.compute_team_winner
      last_set_var.save!
    end
    self.team_winner = compute_team_winner
    save!
  end

  # Class to remove last scoring change
  # There is no undo stack.  The last operation can be
  # determined by the state of the match.
  class RemoveLastScoringChangeHelper
    def initialize(match)
      @match = match
      @save_list = []
      @destroy_list = []
      remove_last
    end

    attr_reader :save_list
    attr_reader :destroy_list
    attr_reader :match

    private

    def remove_last
      if match.team_winner
        match.team_winner = nil
        save_list << match
      elsif match.last_set
        remove_last_set_change(match.last_set)
      end
    end

    def remove_last_set_change(last_set_var)
      if last_set_var.team_winner
        remove_last_set_complete(last_set_var)
      elsif last_set_var.ordinal == 1 && last_set_var.set_games.count == 0
        undo_start_match(last_set_var)
      elsif last_set_var.last_game
        remove_last_game_change(last_set_var.last_game)
      else
        # Undo start set
        destroy_list << last_set_var
      end
    end

    def remove_last_set_complete(last_set_var)
      last_set_var.team_winner = nil
      save_list << last_set_var
      if match.min_sets_to_play == 1
        # only one set, so remove one more change
        remove_last_game_change(last_set_var.last_game)
      end
    end

    def undo_start_match(last_set_var)
      match.started = false
      save_list << match
      destroy_list << last_set_var
    end

    def remove_last_game_change(last_game_var)
      last_set_var = last_game_var.match_set
      if last_game_var.team_winner
        # Undo won
        last_game_var.team_winner = nil
        save_list << last_game_var
      else
        # Undo start game
        save_list << match if undo_first_servers(last_set_var)
        last = last_set_var.tiebreaker? ? last_set_var : last_game_var
        destroy_list << last
      end
    end

    def undo_first_servers(last_set_var)
      if match.match_sets.count == 1
        games_count = last_set_var.set_games.count
        match.second_player_server = nil if games_count <= 2
        match.first_player_server = nil if games_count <= 1
        true
      end
    end
  end

  # Class to manage first servers
  class PlayerServersHelper
    def initialize(match)
      @match = match
    end

    attr_reader :match

    # Once the first server(s) are known, the server for a
    # particular game can be calculated.
    def next_player_server
      # Count total games, ignoring tiebreakers
      games_played = match.set_games.all.reduce(0) do |sum, game|
        sum + (game.tiebreaker ? 0 : 1)
      end
      if match.doubles
        next_doubles_server games_played
      else
        next_singles_server games_played
      end
    end

    def players_that_may_serve_first
      unless match.first_team && match.second_team
        raise Exception.InvalidOperation, 'No opponents'
      end
      if first_servers_provided?
        []
      else
        remaining_servers
      end
    end

    # Determine if the players who will serve first are known.
    # For singles and doubles, there is one first
    # server that must be known before the first game can be started.
    # For doubles, there is another player
    # that must be known before the second game is started.
    def first_servers_provided?
      if match.doubles && match.next_game_ordinal > 1
        match.first_player_server && match.second_player_server
      else
        match.first_player_server
      end
    end

    def team_of_player(player)
      if (first_team_var = match.first_team) &&
        first_team_var.include_player?(player)
        first_team_var
      elsif (second_team_var = match.second_team) &&
        second_team_var.include_player?(player)
        second_team_var
      end
    end

    private

    def remaining_servers
      remaining_servers_on_teams.compact
    end

    def remaining_servers_on_teams
      if match.second_player_server
        []
      elsif match.first_player_server
        other_players_on_other_team(match.first_player_server)
      else
        (match.first_team.players + match.second_team.players)
      end
    end

    def next_doubles_server(games_played)
      case games_played % 4
      when 0
        match.first_player_server
      when 1
        match.second_player_server
      when 2
        other_player_on_team match.first_player_server
      when 3
        other_player_on_team match.second_player_server
      end
    end

    def other_player_on_team(player)
      team = team_of_player player
      team.other_player player if team
    end

    def other_players_on_other_team(player)
      team = team_of_player player
      other_team(team).players if team
    end

    def next_singles_server(games_played)
      if games_played.even?
        match.first_player_server
      else
        other_singles_player match.first_player_server
      end
    end

    def other_singles_player(player)
      if player == (first_var = match.first_singles_player)
        match.second_singles_player
      else
        first_var
      end
    end

    def other_team(team)
      if team == (first_var = match.first_team)
        match.second_team
      else
        first_var
      end
    end
  end

  # Class to validate changes to match after start play.
  # For example, the match type (doubles/singles) may not be
  # changed once the match has started.
  class ValidateChangeMatchHelper
    def initialize(match)
      @match = match
      @errors = errors
    end

    attr_reader :errors
    attr_reader :match

    def validate(errors)
      find_invalid_changes do |sym|
        errors.add sym, 'can\'t be changed after match has started'
      end
    end

    private

    # Once the match has started, some attributes must not be changed.
    def find_invalid_changes
      doubles_var = match.doubles
      if match.first_team.id != match.first_team_id_was
        yield doubles_var ? :first_team_id : :first_singles_player
      end
      if match.second_team.id_changed?
        yield doubles_var ? :second_team_id : :second_singles_player
      end
      yield :scoring if match.scoring_changed?
      find_invalid_change_servers { |sym| yield sym }
    end

    def find_invalid_change_servers
      first_set_var = match.first_set
      if first_set_var &&
        (match.first_player_server_id_changed? ||
          match.second_player_server_id_changed?)
        wins = first_set_var.set_games
                 .where('team_winner_id IS NOT NULL').count
        find_invalid_change_server_after_wins(wins) { |sym| yield sym }
      end
    end

    def find_invalid_change_server_after_wins(wins)
      if wins >= 1 && match.first_player_server_id_changed?
        yield :first_player_server_id
      end
      if match.doubles && wins >= 2 && second_player_server_id_changed?
        yield :second_player_server_id
      end
    end
  end

  # Class to validate the match attributes
  class ValidationHelper
    def initialize(match)
      @match = match
    end

    attr_reader :match

    def validate(errors)
      that_first_and_second_opponents_different(errors)
      that_player_servers_on_different_teams(errors)
      that_scoring_is_known(errors)
      that_can_change_after_start_play(errors)
      that_teams_or_players_are_present(errors)
    end

    private

    def that_first_and_second_opponents_different(errors)
      if match.doubles
        that_doubles_teams_different(errors)
      else
        that_singles_players_different(errors)
      end
    end

    def that_doubles_teams_different(errors)
      unless match.first_team.nil? || match.first_team != match.second_team
        errors.add(:second_team, 'must not be the same as first team')
      end
    end

    def that_singles_players_different(errors)
      unless match.first_singles_player.nil? ||
        match.first_singles_player != match.second_singles_player
        errors.add(:second_singles_player,
                   'must not be the same as first player')
      end
    end

    def that_player_servers_on_different_teams(errors)
      if match.first_player_server && match.second_player_server
        if match.team_of_player(match.first_player_server) ==
          match.team_of_player(match.second_player_server)
          errors.add(:first_player_server,
                     'may not be in the same team as second server')
        end
      end
    end

    def that_scoring_is_known(errors)
      unless match.scoring.blank?
        s = [:one_eight_game, :two_six_game_ten_point, :three_six_game]
        errors.add(:scoring,
                   'invalid value') unless s.include? match.scoring.to_sym
      end
    end

    def that_can_change_after_start_play(errors)
      if match.started
        helper = ValidateChangeMatchHelper.new(match)
        helper.validate(errors)
      end
    end

    def that_teams_or_players_are_present(errors)
      fields = if match.doubles
                 [:first_team, :second_team]
               else
                 [:first_singles_player, :second_singles_player]
               end
      fields.each do |sym|
        value = match.send(sym)
        errors.add sym, 'must not be blank' unless value
      end
    end
  end

  # Helper class to start games, tiebreaker, sets and match tiebreakers
  class StartNextHelper
    def initialize(match)
      @match = match
    end

    attr_reader :match

    def start_next_game?
      start_next_game_kind? :game
    end

    def start_tiebreaker?
      start_next_game_kind? :tiebreaker
    end

    def start_next_set?
      start_next_set_kind? :set
    end

    def start_match_tiebreaker?
      start_next_set_kind? :tiebreaker
    end

    def start_next_game
      start_next_game_kind :game
    end

    def start_tiebreaker
      start_next_game_kind :tiebreaker
    end

    private

    def start_next_game_kind?(kind)
      last_set_var = match.last_set
      if last_set_var && last_set_var.state == :in_progress &&
        no_game_in_progress(last_set_var)
        (kind == :tiebreaker) ==
          last_set_var.tiebreaker_game?(last_set_var.set_games.count + 1)
      end
    end

    def no_game_in_progress(last_set_var)
      last_game = last_set_var.set_games.last
      last_game.nil? || last_game.state == :finished
    end

    def start_next_set_kind?(kind)
      last_set_var = match.last_set
      if match.state == :in_progress && no_set_in_progress?(last_set_var)
        (kind == :tiebreaker) ==
          match.tiebreaker_set?(match.match_sets.count + 1)
      end
    end

    def no_set_in_progress?(last_set_var)
      last_set_var.nil? || last_set_var.state == :complete
    end

    def start_next_game_kind(kind)
      last_set_var = match.last_set
      raise Exceptions::InvalidOperation, 'No set' unless last_set_var
      game = SetGame.new(ordinal: match.next_game_ordinal,
                         tiebreaker: kind == :tiebreaker)
      assign_game_server(game) unless game.tiebreaker
      last_set_var.set_games << game
      game
    end

    def assign_game_server(game)
      game.player_server = match.next_player_server
      if game.player_server.nil?
        raise Exceptions::InvalidOperation, 'Next player server unknown'
      end
    end
  end

  # Helper class to complete games, tiebreakers, sets and match tiebreakers
  class CompleteCurrentHelper
    def initialize(match)
      @match = match
    end

    attr_reader :match

    def win_game?
      win_game_kind? :game
    end

    def win_tiebreaker?
      # last_set_var = match.last_set
      # last_set_var && !last_set_var.tiebreaker? &&
      win_game_kind?(:tiebreaker)
    end

    def complete_set?
      complete_set_kind? :set unless match.min_sets_to_play == 1
    end

    def complete_match_tiebreaker?
      complete_set_kind? :tiebreaker
    end

    def win_match_tiebreaker?
      # last_set_var = match.last_set
      # last_set_var && last_set_var.tiebreaker? &&
      win_game_kind?(:match_tiebreaker)
    end

    def win_tiebreaker(team)
      # last_set_var = match.last_set
      # last_set_var && !last_set_var.tiebreaker? &&
      win_game_kind team, :tiebreaker
    end

    def win_game(team)
      win_game_kind team, :game
    end

    def win_match_tiebreaker(team)
      win_game_kind team, :match_tiebreaker
    end

    attr_reader :match

    def win_game_kind?(kind)
      if match.started
        last_set_var = match.last_set
        last_game = last_set_var.last_game if last_set_var
        if last_game && last_game.state == :in_progress
          if last_set_var.tiebreaker?
            (kind == :match_tiebreaker)
          elsif last_game.tiebreaker?
            (kind == :tiebreaker)
          else
            kind == :game
          end
        end
      end
    end

    def complete_set_kind?(kind)
      last_set_var = match.last_set
      last_set_finished = last_set_var && last_set_var.state == :finished
      if last_set_finished
        tiebreaker = last_set_var.tiebreaker?
        (kind == :tiebreaker) == tiebreaker
      end
    end

    def win_game_kind(team, kind)
      last_set_var = match.last_set
      raise Exceptions::NotFound, 'Set not found' unless last_set_var
      game = last_set_var.last_game
      raise Exceptions::NotFound, 'Game not found' unless game
      valid_kind = if last_set_var.tiebreaker?
                     kind == :match_tiebreaker
                   elsif game.tiebreaker?
                     kind == :tiebreaker
                   else
                     kind == :game
                   end
      raise Exceptions::InvalidOperation, 'Invalid kind' unless valid_kind
      game.team_winner_id = team.id
      game
    end
  end
end
