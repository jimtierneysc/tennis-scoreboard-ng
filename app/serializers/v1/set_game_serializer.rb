class V1::SetGameSerializer < ActiveModel::Serializer
  attributes :winner, :server

  def winner
    # TODO: faster lookup
    unless object.team_winner.nil?
      if object.match_set.match.doubles
        object.team_winner.id
      else
        object.team_winner.first_player.id
      end
    else
      nil
    end
  end

  def attributes(*args)
    hash = super
    hash[:tiebreak] = true if object.tiebreak?
    hash
  end

  def server
    object.player_server_id
  end

end
