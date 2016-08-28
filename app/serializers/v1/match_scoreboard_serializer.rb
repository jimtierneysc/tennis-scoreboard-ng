class V1::MatchScoreboardSerializer < V1::MatchSerializer
  attributes :id, :title, :scoring, :doubles, :state, :winner, :sets, :actions, :errors, :servers,
             :near_winners

  def sets
    ActiveModel::ArraySerializer.new(object.match_sets, each_serializer: V1::MatchSetSerializer)
  end

  def actions
    object.play_actions
  end

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
