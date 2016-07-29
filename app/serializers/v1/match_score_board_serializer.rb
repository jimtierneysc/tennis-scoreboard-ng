class V1::MatchScoreBoardSerializer < V1::MatchSerializer
  attributes :id, :title, :scoring, :doubles, :state, :winner, :sets, :actions, :errors, :servers,

  def sets
    ActiveModel::ArraySerializer.new(object.match_sets, each_serializer: V1::MatchSetSerializer)
  end

  def actions
    # TODO: Array rather than hash?
    object.play_actions
  end

  def winner
    unless object.team_winner.nil?
      if object.doubles
        object.team_winner.id
      else
        object.team_winner.first_player.id
      end
    else
      nil
    end
  end

  def attributes
    data = super
    if object.doubles
      data[:first_team] = first_team
      data[:second_team] = second_team
    else
      data[:first_player] = first_player
      data[:second_player] = second_player
    end
    data[:version] = object.play_version
    data
  end

  def first_player
    V1::PlayerSerializer.new(object.first_team.first_player, root: false)
  end

  def first_team
    V1::OpponentTeamSerializer.new(object.first_team, root: false)
  end

  def second_player
    V1::PlayerSerializer.new(object.second_team.first_player, root: false)
  end

  def second_team
    V1::OpponentTeamSerializer.new(object.second_team, root: false)
  end

  def servers
    result = []
    result.push(object.first_player_server.id) if object.first_player_server
    result.push(object.second_player_server.id) if object.second_player_server
    result
  end

end
