module MatchPlayHelpers

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

    def team_of_player(player)
      if match.first_team.include_player?(player)
        match.first_team
      elsif match.second_team.include_player?(player)
        match.second_team
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
      team = team_of_player player
      if team.first_player == player
        team.second_player
      else
        team.first_player
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
      unless match.first_player.nil? ||
        match.first_player != match.second_player
        errors.add(:second_player,
                   'must not be the same as first player')
      end
    end

    def that_player_servers_on_different_teams(errors)
      if match.first_player_server && match.second_player_server
        if match.team_of_player(match.first_player_server) ==
          match.team_of_player(match.second_player_server)
          errors.add(:first_server,
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
      doubles_var = match.doubles
      if match.first_team.id != match.first_team_id_was
        yield doubles_var ? :first_team_id : :first_player
      end
      if match.second_team.id != match.second_team_id_was
        yield doubles_var ? :second_team_id : :second_player
      end
      yield :doubles if match.doubles_changed?
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
      if match.doubles && wins >= 2 && match.second_player_server_id_changed?
        yield :second_player_server_id
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
      game.player_server = match.next_player_server
      if game.player_server.nil?
        raise Exceptions::InvalidOperation, 'Next player server unknown'
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