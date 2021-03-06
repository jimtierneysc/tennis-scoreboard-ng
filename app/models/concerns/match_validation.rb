# Validate changes to a Match
module MatchValidation

  # Help validate the changes to match attributes
  # * *Args*
  #   - +match+ -> Match
  # * *Params*
  #   * +:errors+ - hash
  #     * Errors will be added to this hash
  def self.validate(match, errors)
    Validator.new(match).validate(errors)
  end

  private

  # Help validate
  # the changes to match attributes
  class Validator

    # * *Args*
    #   - +match+ -> Match
    def initialize(match)
      @match = match
    end

    # Check for various error conditions:
    # * Both opponents may not be the same team or player
    # * The server of the second doubles game must be valid
    #   * Must not be on the same team as the server of the first
    # * The +:scoring+ kind must be known
    # * The opponents must be known
    # * The attributes must be permitted to change
    #   * Many attributes can not be changed after the match has started
    #     * opponents
    #     * doubles
    #     * scoring kind
    # * *Params*
    #   * +:errors+ - hash
    #     * Errors will be added to this hash
    def validate(errors)
      that_first_and_second_opponents_different(errors)
      that_player_servers_on_different_teams(errors)
      that_scoring_is_known(errors)
      that_can_change_after_start_play(errors)
      that_teams_or_players_are_present(errors)
    end

    private

    attr_reader :match

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
        ValidateChangeMatch.new(match).validate(errors)
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

    # Class to validate changes to a match after play has started.
    # The match opponents may not be changed, for example.
    class ValidateChangeMatch
      # * *Args*
      #   - +match+ -> Match
      def initialize(match)
        @match = match
      end

      # Check for invalid changes to the match.  Add error messages to a hash.
      # * *Args*
      #   - +errors+ -> hash
      def validate(errors)
        find_invalid_changes do |sym|
          errors.add sym, 'can\'t be changed after match has started'
        end
      end

      private

      attr_reader :errors
      attr_reader :match

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
          # find_invalid_change_server_after_wins(wins) { |sym| yield sym }
          if wins >= 1 && match.first_player_server_id_changed?
            yield :first_player_server_id
          end
          if match.doubles && wins >= 2 && match.second_player_server_id_changed?
            yield :second_player_server_id
          end
        end
      end

    end
  end
end