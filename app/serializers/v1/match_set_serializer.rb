class V1::MatchSetSerializer < ActiveModel::Serializer
  attributes :scoring, :winner, :games, :state

  def games
    ActiveModel::ArraySerializer.new(object.set_games, each_serializer: V1::SetGameSerializer)
  end

  def winner
    if object.team_winner.nil?
      nil
    else
      if object.match.doubles
        object.team_winner.id
      else
        object.team_winner.first_player.id
      end
    end
  end

end
