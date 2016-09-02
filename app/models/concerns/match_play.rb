# Execute actions to play a match, such as
# +:win_game+
module MatchPlay

  # Class to start a match, start a game, win a game, etc.
  class PlayMethods

    def initialize(match)
      @match = match
    end


    # Lookup the methods to handle a particular match play
    # action such as +:win_game+
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

    # Operations to play a match.
    #
    # These methods start a match, start a set, start a game,
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
      update_start_play!
    end

    # Starts a new set.  NOP if called immediately after start_play
    def start_set?
      start_next_helper.start_set?
    end

    def start_set!
      unless start_set?
        raise Exceptions::InvalidOperation,
              "Can\'t start set #{match.match_sets.count}"
      end
      set = create_new_set
      set.save!
      game = start_next_helper.start_game
      game.save!
    end

    # Start a new game.  A game will be added to the current set.
    # The server will be computed and assigned to the game.
    def start_game?
      start_next_helper.start_game?
    end

    def start_game!(player_server = nil)
      if player_server
        update_first_or_second_player_server!(player_server)
      end
      update_start_game!
    end

    def win_game?
      complete_current_helper.win_game?
    end

    # complete! will complete current set if enough games have been won.
    # Then, will complete the match if enough sets have been won.
    def complete!
      complete_set_play! if complete_set_play?
      complete_match_tiebreak! if complete_match_tiebreak?
      complete_play! if complete_play?
    end

    def win_game!(team)
      unless win_game?
        raise Exceptions::InvalidOperation,
              "Can\'t win game #{match.last_set ? match.last_set.set_games.count : 0}"
      end
      game = complete_current_helper.win_game team
      game.save!
      complete!
      game
    end

    # Start a tiebreak at the end of a set.
    def start_tiebreak?
      start_next_helper.start_tiebreak?
    end

    def start_tiebreak!
      unless start_tiebreak?
        raise Exceptions::InvalidOperation, 'can\'t start tiebreak'
      end
      game = start_next_helper.start_tiebreak
      game.save!
      game
    end

    # Win a tiebreak.  The winning team must be provided.
    def win_tiebreak?
      complete_current_helper.win_tiebreak?
    end

    def win_tiebreak!(team)
      unless win_tiebreak?
        raise Exceptions::InvalidOperation, 'can\'t win tiebreak'
      end
      game = complete_current_helper.win_tiebreak team
      game.save!
      complete!
      game
    end

    # Complete a set.  A set can be completed once a player has won the set.
    def complete_set_play?
      complete_current_helper.complete_set?
    end

    def complete_set_play!
      if complete_set_play?
        last_set_var = match.last_set
        last_set_var.team_winner = last_set_var.compute_team_winner
        last_set_var.save!
      end
    end

    # Start a match tiebreak.  A match tiebreak can be
    # created after each player has won an equal number of sets.
    def start_match_tiebreak?
      start_next_helper.start_match_tiebreak?
    end

    def start_match_tiebreak!
      unless start_match_tiebreak?
        raise Exceptions::InvalidOperation, 'Can\'t start match tiebreak'
      end
      set = create_new_set
      set.save!
      game = start_next_helper.start_tiebreak
      game.save!
    end

    # Win the match tiebreak.
    def win_match_tiebreak?
      complete_current_helper.win_match_tiebreak?
    end

    def win_match_tiebreak!(team)
      unless win_match_tiebreak?
        raise Exceptions::InvalidOperation, 'Can\'t win match tiebreak'
      end
      game = complete_current_helper.win_match_tiebreak team
      game.save!
      complete!
      game
    end

    # Complete match tiebreak.
    def complete_match_tiebreak?
      complete_current_helper.complete_match_tiebreak?
    end

    def complete_match_tiebreak!
      if complete_match_tiebreak?
        last_set_var = match.last_set
        last_set_var.team_winner = last_set_var.compute_team_winner
        last_set_var.save!
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

    # Discard all of the match scoring.
    def discard_play?
      match.started
    end

    def discard_play!
      unless discard_play?
        raise Exceptions::InvalidOperation, 'Can\'t discard play'
      end
      update_discard_play!
    end

    # Back out one scoring operation.
    def remove_last_change!
      unless remove_last_change?
        raise Exceptions::InvalidOperation, 'Can\'t remove last change'
      end
      helper = RemoveLastScoringChange.new(match)
      helper.save_list.each(&:save!)
      helper.destroy_list.each(&:destroy)
    end

    def remove_last_change?
      match.started
    end

    def create_new_set
      ordinal = match.match_sets.count + 1
      set = MatchSet.new(match_id: match.id,
                         ordinal: ordinal,
                         scoring: match.scoring_of_set_ordinal(ordinal))
      match.match_sets << set
      set # fluent
    end

    def update_discard_play!
      match.match_sets.destroy_all
      match.first_player_server = nil
      match.second_player_server = nil
      match.started = false
      match.team_winner = nil
      match.save!
    end

    def update_start_play!
      match.started = true
      match.save!
      set = create_new_set
      set.save!
    end

    def update_first_or_second_player_server!(player)
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

    def update_start_game!
      unless start_game?
        last_set_var = match.last_set
        raise Exceptions::InvalidOperation,
              "can\'t start game #{last_set_var ? last_set_var.set_games.count : 0}"
      end
      game = start_next_helper.start_game
      game.save!
      game
    end

    def start_next_helper
      @start_next_helper ||= StartNext.new(match)
    end

    def complete_current_helper
      @complete_current_helper ||= CompleteCurrent.new(match)
    end

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
            player = options[:player] if options
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
      player = options[:player]
      team = options[:team]
      opponent = options[:opponent] unless player || team
      if opponent
        if opponent.is_a? Team
          team = opponent
        elsif opponent.is_a? Player
          player = opponent
        end
      end
      # return
      if player
        match.doubles ? nil : player.singles_team!
      else
        team
      end
    end


    # Class to remove last state change.  For example, after a game has been started, this
    # class will remove the game.
    class RemoveLastScoringChange
      def initialize(match)
        @match = match
        @save_list = []
        @destroy_list = []
        remove_last
      end

      attr_reader :save_list
      attr_reader :destroy_list

      private

      attr_reader :match

      def remove_last
        if match.team_winner
          remove_match_complete
        elsif match.last_set
          remove_last_set_change(match.last_set)
        end
      end

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

    # Helper class to start games, tiebreaks, sets, and match tiebreaks
    class StartNext
      def initialize(match)
        @match = match
      end

      def start_game?
        start_game_kind? :game
      end

      def start_tiebreak?
        start_game_kind? :tiebreak
      end

      def start_set?
        start_set_kind? :set
      end

      def start_match_tiebreak?
        start_set_kind? :tiebreak
      end

      def start_game
        start_game_kind :game
      end

      def start_tiebreak
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
        game.player_server = player_servers_helper.next_player_server
        if game.player_server.nil?
          raise Exceptions::InvalidOperation, 'Next player server unknown'
        end
      end

      def player_servers_helper
        @player_servers_helper ||= PlayerServersHelper.new(match)
      end


      # Class to manage first servers.  At the beginning of a match a particular
      # player must server first.
      class PlayerServersHelper
        def initialize(match)
          @match = match
        end

        # Once the first server(s) are known, the server for a
        # particular game can be calculated.
        def next_player_server
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

    end

    # Helper class to complete games, tiebreaks, sets and match tiebreaks
    class CompleteCurrent
      def initialize(match)
        @match = match
      end

      def win_game?
        win_game_kind? :game
      end

      def win_tiebreak?
        win_game_kind?(:tiebreak)
      end

      def complete_set?
        complete_set_kind? :set unless match.min_sets_to_play == 1
      end

      def complete_match_tiebreak?
        complete_set_kind? :tiebreak
      end

      def win_match_tiebreak?
        win_game_kind?(:match_tiebreak)
      end

      def win_tiebreak(team)
        win_game_kind team, :tiebreak
      end

      def win_game(team)
        win_game_kind team, :game
      end

      def win_match_tiebreak(team)
        win_game_kind team, :match_tiebreak
      end

      private

      attr_reader :match

      def win_game_kind?(kind)
        if match.started
          last_set_var = match.last_set
          last_game = last_set_var.last_game if last_set_var
          if last_game && last_game.state == :in_progress
            if last_set_var.tiebreak?
              (kind == :match_tiebreak)
            elsif last_game.tiebreak?
              (kind == :tiebreak)
            else
              kind == :game
            end
          end
        end
      end

      def complete_set_kind?(kind)
        last_set_var = match.last_set
        last_set_finished = last_set_var && last_set_var.compute_team_winner
        if last_set_finished
          tiebreak = last_set_var.tiebreak?
          (kind == :tiebreak) == tiebreak
        end
      end

      def win_game_kind(team, kind)
        last_set_var = match.last_set
        raise Exceptions::NotFound, 'Set not found' unless last_set_var
        game = last_set_var.last_game
        raise Exceptions::NotFound, 'Game not found' unless game
        valid_kind = if last_set_var.tiebreak?
                       kind == :match_tiebreak
                     elsif game.tiebreak?
                       kind == :tiebreak
                     else
                       kind == :game
                     end
        raise Exceptions::InvalidOperation, 'Invalid kind' unless valid_kind
        raise Exceptions::InvalidOperation, 'Invalid type' unless team.is_a? Team
        game.team_winner_id = team.id
        game
      end
    end
  end

end