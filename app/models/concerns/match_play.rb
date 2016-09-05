# Executes actions to play a match. Executes the ':win_game' action to
# win the current game in progress, for example.
module MatchPlay

  # Class to help work with actions:
  # * Indicate whether a particular action is enabled
  # * Get a hash of all enabled actions
  # * Execute an action
  # actions include +:win_game+, +:start_game+, and +:discard_play+.
  # See Match.play_match!
  #
  class PlayActions

    # * *Args*
    #   - +match+ -> Match
    def initialize(match)
      @match = match
    end

    # Lookup the methods to handle a particular action
    #
    # * *Args*    :
    #   - +action+ -> +:win_game+, +:start_game+ etc.
    # * *Returns* : Hash or nil
    #   - +:exec+ - method to execute the action
    #   - +:query+ - method to determine if the action is enabled
    def lookup_method(action)
      action = action.to_sym
      play_methods_table[action] if play_methods_table.has_key? action
    end

    # Generate a hash of valid actions
    #
    # * *Returns* : Hash
    # === Example
    #   {
    #     start_game: true,
    #     discard_play: true,
    #     remove_last_change: true
    #   }
    def valid_actions
      result = {}
      play_methods_table.each do |k, v|
        if v[:query].call
          result[k] = true
        end
      end
      result
    end

    private

    attr_reader :match

    def play_methods_table
      unless @methods
        @methods = {}
        syms = [:start_play,
                :discard_play, :start_set,
                :start_game, :start_tiebreak, :remove_last_change,
                :start_match_tiebreak,
                :win_game, :win_tiebreak, :win_match_tiebreak]
        syms.each do |sym|
          @methods[sym] =
            {
              exec: nil,
              query: method("#{sym}?")
            }
        end

        [:win_game, :win_tiebreak, :win_match_tiebreak].each do |sym|
          # Methods with team parameter
          @methods[sym][:exec] = lambda do |options|
            team = team_from_options options if options
            raise Exceptions::UnknownOperation, "Unknown team for action: #{sym}" unless team
            method("#{sym}!").call(team)
          end
        end
        # Method with optional player parameter
        [:start_game].each do |sym|
          @methods[sym][:exec] = lambda do |options|
            player = player_from_options options if options
            method("#{sym}!").call(player)
          end
        end
        # Methods with no parameter
        syms.each do |sym|
          if @methods[sym][:exec].nil?
            @methods[sym][:exec] = lambda do |options|
              method("#{sym}!").call
            end
          end
        end
      end
      @methods
    end

    def team_from_options(options)
      opponent = opponent_from_options options
      if opponent[:player]
        match.doubles ? nil : opponent[:player].singles_team!
      else
        opponent[:team]
      end
    end

    def player_from_options(options)
      opponent = opponent_from_options options
      if opponent[:team]
        opponent[:team].first_player
      else
        opponent[:player]
      end
    end

    def opponent_from_options(options)
      result = {
        player: nil,
        team: nil
      }
      opponent = options[:opponent]
      if opponent
        if opponent.is_a? Team
          result[:team] = opponent
        elsif opponent.is_a? Player
          result[:player] = opponent
        end
      end
      result
    end

    # Operations to play a match.
    #
    # The following methods start a match, start a set, start a game,
    # win a game, etc. The methods operate on the match at the current point.
    # For example, win_game! applies to the current game in progress.  If a method
    # is called out of sequence, an exception is raised. Use the "?" methods
    # to determine if an operation is allowed.
    #

    # Starts the match.  Creates the first set.
    def start_play?
      !match.started
    end

    def start_play!
      unless start_play?
        raise Exceptions::InvalidOperation, 'Can\'t start play'
      end
      match.started = true
      match.save!
      set = create_new_set
      set.save!
    end

    # Starts a new set.  NOP if called immediately after start_play
    def start_set?
      start.set?
    end

    def start_set!
      unless start.set?
        raise Exceptions::InvalidOperation,
              "Can\'t start set #{match.match_sets.count}"
      end
      set = create_new_set
      set.save!
      game = start.game
      game.save!
    end

    # Start a new game.  A game will be added to the current set.
    # The server will be computed and assigned to the game.
    def start_game?
      start.game?
    end

    def start_game!(player_server = nil)
      if player_server
        update_player_server!(player_server)
      end
      unless start.game?
        last_set_var = match.last_set
        raise Exceptions::InvalidOperation,
              "can\'t start game #{last_set_var ? last_set_var.set_games.count : 0}"
      end
      game = start.game
      game.save!
      game
    end

    def win_game?
      win.game?
    end

    def win_game!(team)
      unless win.game?
        raise Exceptions::InvalidOperation,
              "Can\'t win game #{match.last_set ? match.last_set.set_games.count : 0}"
      end
      game = win.game team
      game.save!
      complete!
      game
    end

    # Start a tiebreak at the end of a set.
    def start_tiebreak?
      start.tiebreak?
    end

    def start_tiebreak!
      unless start.tiebreak?
        raise Exceptions::InvalidOperation, 'can\'t start tiebreak'
      end
      game = start.tiebreak
      game.save!
      game
    end

    # Win a tiebreak.  The winning team must be provided.
    def win_tiebreak?
      win.tiebreak?
    end

    def win_tiebreak!(team)
      unless win.tiebreak?
        raise Exceptions::InvalidOperation, 'can\'t win tiebreak'
      end
      game = win.tiebreak team
      game.save!
      complete!
      game
    end

    # Start a match tiebreak.  A match tiebreak can be
    # created after each player has won an equal number of sets.
    def start_match_tiebreak?
      start.match_tiebreak?
    end

    def start_match_tiebreak!
      unless start.match_tiebreak?
        raise Exceptions::InvalidOperation, 'Can\'t start match tiebreak'
      end
      set = create_new_set
      set.save!
      game = start.tiebreak
      game.save!
    end

    # Win the match tiebreak.
    def win_match_tiebreak?
      win.match_tiebreak?
    end

    def win_match_tiebreak!(team)
      unless win.match_tiebreak?
        raise Exceptions::InvalidOperation, 'Can\'t win match tiebreak'
      end
      game = win.match_tiebreak team
      game.save!
      complete!
      game
    end

    # Discard all of the match scoring.
    def discard_play?
      match.started
    end

    def discard_play!
      unless discard_play?
        raise Exceptions::InvalidOperation, 'Can\'t discard play'
      end
      match.match_sets.destroy_all
      match.first_player_server = nil
      match.second_player_server = nil
      match.started = false
      match.team_winner = nil
      match.save!
    end

    # Back out one scoring operation.
    def remove_last_change!
      unless remove_last_change?
        raise Exceptions::InvalidOperation, 'Can\'t remove last change'
      end
      RemoveLastChange.new(match).remove_last
    end

    def remove_last_change?
      match.started
    end

    # Utility methods and helpers

    # Update first or second player serving in the match
    def update_player_server!(player)
      raise Exceptions::InvalidOperation, 'Player required' unless player
      raise Exceptions::InvalidOperation, 'Invalid type' unless player.is_a? Player
      if match.first_player_server.nil?
        match.first_player_server = player
        match.save!
      elsif match.second_player_server.nil?
        match.second_player_server = player
        match.save!
      end
    end

    def create_new_set
      ordinal = match.match_sets.count + 1
      set = MatchSet.new(match_id: match.id,
                         ordinal: ordinal,
                         scoring: match.scoring_of_set(ordinal))
      match.match_sets << set
      set # fluent
    end

    def complete!
      CompleteSetAndMatch.new(match).complete!
    end

    def start
      @start ||= StartNext.new(match)
    end

    def win
      @win ||= WinGame.new(match)
    end
  end


  # Class to remove the last scoring change.  Removing the last scoring change may
  # involve deleting games or sets, or changing attribute values.
  class RemoveLastChange

    # * *Args*
    #   - +match+ -> Match
    def initialize(match)
      @match = match
    end


    # Execute +:remove_last_change+ action by updating and/or
    # deleting entities.
    def remove_last
      @save_list = []
      @destroy_list = []
      if match.team_winner
        remove_match_complete
      elsif match.last_set
        remove_last_set_change(match.last_set)
      end
      save_list.each(&:save!)
      destroy_list.each(&:destroy)
    end


    private

    attr_reader :match
    # List of entities that need to be saved in order
    # to remove the last change
    attr_reader :save_list

    # List of entities that need to be destroyed in
    # order to remove the last change
    attr_reader :destroy_list

    def remove_match_complete
      match.team_winner = nil
      save_list << match
      remove_last_set_complete match.last_set
    end

    def remove_last_set_change(last_set_var)
      if last_set_var.team_winner
        remove_last_set_complete(last_set_var)
      elsif last_set_var.set_games.count == 0
        # First set may have zero games.  Other sets always start with one.
        undo_start_match(last_set_var)
      else
        remove_last_game_change(last_set_var.last_game)
      end
    end

    def remove_last_set_complete(last_set_var)
      last_set_var.team_winner = nil
      save_list << last_set_var
      remove_last_game_change(last_set_var.last_game)
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
        # Discard set if first game in set but not first game in match
        last = if last_set_var.ordinal > 1 && last_set_var.set_games.count == 1
                 last_set_var
               else
                 last_game_var
               end
        destroy_list << last
        save_list << match if undo_first_servers(last_set_var)
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

  # Class to help with starting games, tiebreaks, sets, and match tiebreaks
  class StartNext

    # * *Args*
    #   - +match+ -> Match
    def initialize(match)
      @match = match
    end

    # Indicate if a game can be started
    def game?
      start_game_kind? :game
    end

    # Indicate if a tiebreak game can be started
    def tiebreak?
      start_game_kind? :tiebreak
    end

    # Indicate if a set can be started
    def set?
      start_set_kind? :set
    end

    # Indicate if the match tiebreak set can be started
    def match_tiebreak?
      start_set_kind? :tiebreak
    end

    # Start the next game
    def game
      start_game_kind :game
    end

    # Start the next tiebreak game
    def tiebreak
      start_game_kind :tiebreak
    end

    private

    attr_reader :match

    def start_game_kind?(kind)
      last_set_var = match.last_set
      if last_set_var && last_set_var.state == :in_progress &&
        no_game_in_progress(last_set_var)
        (kind == :tiebreak) ==
          last_set_var.tiebreak_game?(last_set_var.set_games.count + 1)
      end
    end

    def no_game_in_progress(last_set_var)
      last_game = last_set_var.set_games.last
      last_game.nil? || last_game.state == :finished
    end

    def start_set_kind?(kind)
      last_set_var = match.last_set
      if match.state == :in_progress && no_set_in_progress?(last_set_var)
        (kind == :tiebreak) ==
          match.tiebreak_set?(match.match_sets.count + 1)
      end
    end

    def no_set_in_progress?(last_set_var)
      last_set_var.nil? || last_set_var.state == :complete
    end

    def start_game_kind(kind)
      last_set_var = match.last_set
      raise Exceptions::InvalidOperation, 'No set' unless last_set_var
      game = SetGame.new(ordinal: match.next_game_ordinal,
                         tiebreaker: kind == :tiebreak)
      assign_game_server(game) unless game.tiebreak?
      last_set_var.set_games << game
      game
    end

    def assign_game_server(game)
      game.player_server = NextServer.new(match).player
      if game.player_server.nil?
        raise Exceptions::InvalidOperation, 'Next player server unknown'
      end
    end
  end

  # Class to determine which player serves next
  class NextServer

    # * *Args*
    #   - +match+ -> Match
    def initialize(match)
      @match = match
    end

    # Determine the serving player.  In a singles match, serving alternates between
    # the two opponent players.  In doubles, serving alternates between each opponent team and
    # the players on each team.
    # * *Returns* : Player
    def player
      # Count total games, ignoring tiebreaks
      games_played = match.set_games.all.reduce(0) do |sum, game|
        sum + (game.tiebreak? ? 0 : 1)
      end
      if match.doubles
        next_doubles_server games_played
      else
        next_singles_server games_played
      end
    end

    private

    attr_reader :match

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
      team = match.team_of_player player
      if team
        if team.first_player == player
          team.second_player
        else
          team.first_player
        end
      end
    end

    def next_singles_server(games_played)
      if games_played.even?
        match.first_player_server
      else
        other_singles_player match.first_player_server
      end
    end

    def other_singles_player(player)
      first = match.first_player
      if player == first
        match.second_player
      else
        first
      end
    end
  end

  # Class to help with winning games
  class WinGame

    # * *Args*
    #   - +match+ -> Match
    def initialize(match)
      @match = match
    end

    # Indicate if a game can be won (a game is in progress)
    def game?
      win_game_kind? :game
    end

    # Indicate if a tiebreak game can be won (a tiebreak game is in progress).
    def tiebreak?
      win_game_kind?(:tiebreak)
    end

    # Indicate if a match tiebreak game can be completed (a match tiebreak is in progress)
    def match_tiebreak?
      win_game_kind?(:match_tiebreak)
    end

    # Win a tiebreak game at the end of a set
    def tiebreak(team)
      win_game_kind team, :tiebreak
    end

    # Win a normal game
    def game(team)
      win_game_kind team, :game
    end

    # Win a tiebreak game in a match tiebreaker
    def match_tiebreak(team)
      win_game_kind team, :match_tiebreak
    end

    private

    attr_reader :match

    def win_game_kind?(kind)
      current_game_kind kind
    end

    def win_game_kind(team, kind)
      game = current_game_kind kind
      raise Exceptions::NotFound, 'Game not found' unless game
      raise Exceptions::InvalidOperation, 'Invalid type' unless team.is_a? Team
      game.team_winner_id = team.id
      game
    end

    def current_game_kind(kind)
      result = nil
      if match.started
        last_set_var = match.last_set
        last_game = last_set_var.last_game if last_set_var
        if last_game && last_game.state == :in_progress
          if last_set_var.tiebreak?
            result = last_game if kind == :match_tiebreak
          elsif last_game.tiebreak?
            result = last_game if kind == :tiebreak
          else
            result = last_game if kind == :game
          end
        end
      end
      result
    end
  end

  # Class to help with completing a set and the match. A set or the match may be completed when
  # there is a winner.
  class CompleteSetAndMatch

    # * *Args*
    #   - +match+ -> Match
    def initialize(match)
      @match = match
    end

    # Complete the current set if enough games have been won.
    # Then, complete the match if enough sets have been won.
    def complete!
      complete_set_play! if complete_set?
      complete_match_tiebreak! if complete_match_tiebreak?
      complete_play! if complete_play?
    end

    private

    attr_reader :match

    # Indicate if a set has a winner.
    def complete_set?
      completed_kind? :set unless match.min_sets_to_play == 1
    end

    # Indicate if a match tiebreak has a winner.
    def complete_match_tiebreak?
      completed_kind? :tiebreak
    end

    def completed_kind?(kind)
      last_set_var = match.last_set
      last_set_finished = last_set_var && last_set_var.compute_team_winner
      if last_set_finished
        tiebreak = last_set_var.tiebreak?
        (kind == :tiebreak) == tiebreak
      end
    end

    def complete_set_play!
      if complete_set?
        last_set_var = match.last_set
        last_set_var.team_winner = last_set_var.compute_team_winner
        last_set_var.save!
      end
    end

    def complete_match_tiebreak!
      if complete_match_tiebreak?
        last_set_var = match.last_set
        last_set_var.team_winner = last_set_var.compute_team_winner
        last_set_var.save!
      end
    end

    def complete_play!
      if complete_play?
        if match.min_sets_to_play == 1
          last_set_var = match.last_set
          last_set_var.team_winner = last_set_var.compute_team_winner
          last_set_var.save!
        end
        match.team_winner = match.compute_team_winner
        match.save!
      end
    end

    # Complete the match.
    def complete_play?
      if match.compute_team_winner && !match.completed?
        if match.match_sets.count > 1
          # If multiple sets, then last set must be in complete state
          match.last_set.completed?
        else
          true
        end
      end
    end

  end
end