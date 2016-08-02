module MatchPlayHelpers

  class PlayMethods

    def initialize(match)
      @match = match
    end

    attr_reader :match

    def lookup_method(action)
      action = action.to_sym
      play_methods_table[action] if play_methods_table.has_key? action
    end

    # Return hash of valid actions, for example {start_game: true}
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
      update_start_set!
    end

    # Start a new game.  A game will be added to the current set.
    # The server will be computed and assigned to the game.
    def start_game?
      start_next_helper.start_game?
    end

    def start_game! player_server = nil
      if player_server
        update_first_or_second_player_server!(player_server)
      end
      update_start_game!
    end

    def win_game?
      complete_current_helper.win_game?
    end

    def win_game!(team)
      unless win_game?
        raise Exceptions::InvalidOperation,
              "Can\'t win game #{match.last_set ? match.last_set.set_games.count : 0}"
      end
      game = complete_current_helper.win_game team
      game.save!
      game
    end

    # Start a tiebreaker at the end of a set.
    def start_tiebreaker?
      start_next_helper.start_tiebreaker?
    end

    def start_tiebreaker!
      unless start_tiebreaker?
        raise Exceptions::InvalidOperation, 'can\'t start tiebreaker'
      end
      game = start_next_helper.start_tiebreaker
      game.save!
      game
    end

    # Win a tiebreaker.  The winning team must be provided.
    def win_tiebreaker?
      complete_current_helper.win_tiebreaker?
    end

    def win_tiebreaker!(team)
      unless win_tiebreaker?
        raise Exceptions::InvalidOperation, 'can\'t win tiebreaker'
      end
      game = complete_current_helper.win_tiebreaker team
      game.save!
      game
    end

    # Complete a set.  A set can be completed once a player has won the set.
    def complete_set_play?
      complete_current_helper.complete_set?
    end

    def complete_set_play!
      unless complete_set_play?
        raise Exceptions::InvalidOperation,
              "Can\'t complete set #{match.match_sets.count}"
      end
      last_set_var = match.last_set
      last_set_var.team_winner = last_set_var.compute_team_winner
      last_set_var.save!
    end

    # Start a match tiebreaker.  A match tiebreaker can be
    # created after each player has won an equal number of sets.
    def start_match_tiebreaker?
      start_next_helper.start_match_tiebreaker?
    end

    def start_match_tiebreaker!
      unless start_match_tiebreaker?
        raise Exceptions::InvalidOperation, 'Can\'t start match tiebreaker'
      end
      set = create_new_set
      set.save!
      game = start_next_helper.start_tiebreaker
      game.save!
    end

    # Win the match tiebreaker.
    def win_match_tiebreaker?
      complete_current_helper.win_match_tiebreaker?
    end

    def win_match_tiebreaker!(team)
      unless win_match_tiebreaker?
        raise Exceptions::InvalidOperation, 'Can\'t win match tiebreaker'
      end
      game = complete_current_helper.win_match_tiebreaker team
      game.save!
      game
    end

    # Complete match tiebreaker.
    def complete_match_tiebreaker?
      complete_current_helper.complete_match_tiebreaker?
    end

    def complete_match_tiebreaker!
      unless complete_match_tiebreaker?
        raise Exceptions::InvalidOperation, 'Can\'t complete match tiebreaker'
      end
      last_set_var = match.last_set
      last_set_var.team_winner = last_set_var.compute_team_winner
      last_set_var.save!
    end

    # Complete the match.
    def complete_play?
      if match.compute_team_winner && !match.completed?
        if match.match_sets.count > 1
          # If multiple sets, then last set must be in complete state
          match.last_set.completed?
        else
          # If only one set then don't make user complete it.  Can just
          # complete match.
          true
        end
      end
    end

    def complete_play!
      unless complete_play?
        raise Exceptions::InvalidOperation, 'Can\'t complete play'
      end
      update_complete_play!
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

    # Return match to state after match started.
    def restart_play!
      unless restart_play?
        raise Exceptions::InvalidOperation, 'Can\'t restart play'
      end
      update_discard_play!
      update_start_play!
    end

    def restart_play?
      match.started
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

    def update_start_set!
      set = create_new_set
      set.save!
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

    def update_complete_play!
      if match.min_sets_to_play == 1
        last_set_var = match.last_set
        last_set_var.team_winner = last_set_var.compute_team_winner
        last_set_var.save!
      end
      match.team_winner = match.compute_team_winner
      match.save!
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
        syms = [:start_play, :restart_play,
                :discard_play, :complete_play, :start_set,
                :complete_set_play, :start_game, :start_tiebreaker, :remove_last_change,
                :start_match_tiebreaker, :complete_match_tiebreaker,
                :win_game, :win_tiebreaker, :win_match_tiebreaker]
        syms.each do |sym|
          @methods[sym] =
            {
              exec: nil,
              query: method("#{sym}?")
            }
        end

        [:win_game, :win_tiebreaker, :win_match_tiebreaker].each do |sym|
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


    # Class to remove last state change
    class RemoveLastScoringChange
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
          remove_match_complete
        elsif match.last_set
          remove_last_set_change(match.last_set)
        end
      end

      def remove_match_complete
        match.team_winner = nil
        save_list << match
        if match.min_sets_to_play == 1
          remove_last_set_complete match.last_set
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
        # if match.min_sets_to_play == 1
        #   # only one set, so remove one more change
        #   remove_last_game_change(last_set_var.last_game)
        # end
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
          last = last_set_var.tiebreaker? ? last_set_var : last_game_var
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


    # Helper class to start games, tiebreaker, sets and match tiebreakers
    class StartNext
      def initialize(match)
        @match = match
      end

      attr_reader :match

      def start_game?
        start_game_kind? :game
      end

      def start_tiebreaker?
        start_game_kind? :tiebreaker
      end

      def start_set?
        start_set_kind? :set
      end

      def start_match_tiebreaker?
        start_set_kind? :tiebreaker
      end

      def start_game
        start_game_kind :game
      end

      def start_tiebreaker
        start_game_kind :tiebreaker
      end

      private

      def start_game_kind?(kind)
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

      def start_set_kind?(kind)
        last_set_var = match.last_set
        if match.state == :in_progress && no_set_in_progress?(last_set_var)
          (kind == :tiebreaker) ==
            match.tiebreaker_set?(match.match_sets.count + 1)
        end
      end

      def no_set_in_progress?(last_set_var)
        last_set_var.nil? || last_set_var.state == :complete
      end

      def start_game_kind(kind)
        last_set_var = match.last_set
        raise Exceptions::InvalidOperation, 'No set' unless last_set_var
        game = SetGame.new(ordinal: match.next_game_ordinal,
                           tiebreaker: kind == :tiebreaker)
        assign_game_server(game) unless game.tiebreaker
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

        private

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

    # Helper class to complete games, tiebreakers, sets and match tiebreakers
    class CompleteCurrent
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
        win_game_kind?(:match_tiebreaker)
      end

      def win_tiebreaker(team)
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
        raise Exceptions::InvalidOperation, 'Invalid type' unless team.is_a? Team
        game.team_winner_id = team.id
        game
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
        that_doubles_players_different(errors)
      else
        that_singles_players_different(errors)
      end
    end

    def that_doubles_teams_different(errors)
      unless match.first_team.nil? || match.first_team != match.second_team
        errors.add(:second_team, 'must not be the same as first team')
      end
    end

    def that_doubles_players_different(errors)
      unless match.first_team == match.second_team || match.first_team.nil? || match.second_team.nil?
        arr = [match.first_team.first_player, match.first_team.second_player,
               match.second_team.first_player, match.second_team.second_player]
        arr = arr.compact.map(&:id)
        # All id's unique?
        if arr.uniq.length != arr.length
          errors.add(:second_team, 'must not have players from the first team')
        end
      end
    end

    def that_singles_players_different(errors)
      unless match.first_player.nil? ||
        match.first_player != match.second_player
        errors.add(:second_player,
                   'must not be the same as first player')
      end
    end

    def that_player_servers_on_different_teams(errors)
      first = match.team_of_player(match.first_player_server)
      second = match.team_of_player(match.second_player_server)
      if first && first == second
        errors.add(:first_server,
                   'may not be in the same team as second server')
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
        helper = ValidateChangeMatch.new(match)
        helper.validate(errors)
      end
    end

    def that_teams_or_players_are_present(errors)
      fields = if match.doubles
                 [:first_team, :second_team]
               else
                 [:first_player, :second_player]
               end
      fields.each do |sym|
        value = match.send(sym)
        errors.add sym, 'can\'t be blank' unless value
        if value && sym.to_s.end_with?('team')
          errors.add sym, 'must be doubles team' unless value.doubles
        end
      end
    end
  end

  # Class to validate changes to match after start play.
  # For example, the match type (doubles/singles) may not be
  # changed once the match has started.
  class ValidateChangeMatch
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
      if match.started && !match.started_changed?
        doubles_var = match.doubles
        if match.first_team_id_changed?
          yield doubles_var ? :first_team : :first_player
        end
        if match.second_team_id_changed?
          yield doubles_var ? :second_team : :second_player
        end
        yield :doubles if match.doubles_changed?
        yield :scoring if match.scoring_changed?
        find_invalid_change_servers { |sym| yield sym }
      end
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
      if match.doubles && wins >= 2 && match.second_player_server_id_changed?
        yield :second_player_server_id
      end
    end
  end
end