# Serialize the match score with the following information:
# * Properties of the match (See V1::MatchSerializer)
# * Properties of the sets and games
# * The actions that may be executed on the match
# * Errors that occurred when executing an action
# * The players that may serve the next game
# * The teams that are near to winning a set
# * The teams that are near to winning the match
#
class V1::MatchScoreboardSerializer < V1::MatchSerializer
  attributes :id, :title, :scoring, :doubles, :state, :winner, :sets, :actions, :errors, :servers,
             :near_winners

  # Serialize the sets of the match
  #
  # * *Returns* :
  #   - array of sets
  #
  def sets
    ActiveModel::ArraySerializer.new(object.match_sets, each_serializer: V1::MatchSetSerializer)
  end

  # Actions that may be executed on the match.
  #
  # * *Returns* :
  #   - a hash of actions.  See Match.play_actions.
  #
  def actions
    object.play_actions
  end

  # Teams that are near to winning a set
  # or the match.
  #
  # * *Returns* :
  #   - a hash  (e.g.; {set: [1], match[1]})
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


  # List of players that may serve the first or second game.
  # (One of these players must be passes as a parameter to the
  # +:start_game+ action)
  #
  # * *Returns* :
  #   - an array of player ids
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
