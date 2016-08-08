class V1::MatchScoreBoardSerializer < V1::MatchSerializer
  attributes :id, :title, :scoring, :doubles, :state, :winner, :sets, :actions, :errors, :servers,

  def sets
    ActiveModel::ArraySerializer.new(object.match_sets, each_serializer: V1::MatchSetSerializer)
  end

  def actions
    # TODO: Array rather than hash?
    object.play_actions
  end

  def servers
    result = []
    result.push(object.first_player_server.id) if object.first_player_server
    result.push(object.second_player_server.id) if object.second_player_server
    result
  end

end
