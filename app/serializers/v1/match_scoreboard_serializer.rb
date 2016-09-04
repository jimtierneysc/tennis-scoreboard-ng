# Serialize a match score with the following information:
# * Attributes of the match (See V1::MatchSerializer)
#   * +:id+
#   * +:title+
#   * +:scoring+
#   * +:doubles+
#   * +:state+
#   * +:winner+
# * Attributes related to keeping score
#   * +:sets+ - The sets in the match.  See V1::MatchSetSerializer.
#   * +:actions+ - The actions that may be executed on the match
#   * +:errors+ - Errors that occurred when executing an action
#   * +:server+ - The player id's that may serve the next game
#   * +:near_winner+
#     * The teams or players id's that are near to winning a set
#     * The teams or player id's that are near to winning the match
#
class V1::MatchScoreboardSerializer < V1::MatchSerializer
  attributes :id, :title, :scoring, :doubles, :state, :winner, :sets, :actions, :errors, :servers,
             :near_winners

  # Serialize the sets of the match. See
  # V1::MatchSetSerializer
  #
  # * *Returns* :
  #   - array of sets
  #
  def sets
    V1::ApplicationArraySerializer.new(object.match_sets, each_serializer: V1::MatchSetSerializer)
  end

  # Serialize actions that may be executed on the match.
  # See Match.play_actions
  # * *Returns* : Hash
  # === Example
  #   {
  #     start_game: true,
  #     discard_play: true,
  #     remove_last_change: true
  #   }
  #
  def actions
    object.play_actions
  end

  # Serialize the id's of teams or players that are near to winning a set
  # or the match.  Player id's are serialized for singles matches;
  # Team id's for doubles matches.
  #
  # * *Returns* : Hash
  # === Example
  #   (
  #     set: [10],
  #     match[]
  #   }
  #
  def near_winners
    result = {
      set: [],
      match: []
    }
    first = object.first_team
    second = object.second_team
    last_set_var = object.last_set
    if first && second && last_set_var
      add_near_winner first, last_set_var, result
      add_near_winner second, last_set_var, result
    end

    result
  end


  # Serialize a list of player id's that may serve the first or second game.
  # (One of these players must be passes as a parameter when executing the
  # +:start_game+ action)
  #
  # * *Returns* :
  #   - an array of player ids
  #
  # * Example list before starting a doubles match:
  #
  #   \[10, 20, 30, 40\]
  #
  # * Example list before starting the second game of a doubles match:
  #
  #   \[30, 40\]
  #
  # * Example list before starting the first game of a singles match:
  #
  #   \[10, 20\]
  #
  # * Value for all other cases:
  #
  #   \[\]
  #
  def servers
    result = []
    result.push(object.first_player_server.id) if object.first_player_server
    result.push(object.second_player_server.id) if object.second_player_server
    result
  end

  private

  def add_near_winner(team, set, result)
    if set.near_team_winner? team
      id = opponent_id team
      result[:set].push id
      if object.near_team_winner? team
        result[:match].push id
      end
    end
  end
end
