class V1::MatchSetSerializer < ActiveModel::Serializer
  attributes :scoring, :winner, :games, :state

  def games
    ActiveModel::ArraySerializer.new(object.set_games, each_serializer: V1::SetGameSerializer)
  end

  def winner
    unless object.team_winner.nil?
      if object.match.doubles
        object.team_winner.id
      else
        object.team_winner.first_player.id
      end
    else
      nil
    end
  end

end
