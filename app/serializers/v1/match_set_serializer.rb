# Serialize a MatchSet with the following attributes:
# * +:scoring+
# * +:state+
# * +:winner+
# * +:games+
#
class V1::MatchSetSerializer < V1::ApplicationSerializer
  attributes :scoring, :winner, :games, :state

  # Serialize the games of the set.
  #
  # * *Returns* :
  #   - array of V1::SetGameSerializer
  #
  def games
    V1::ApplicationArraySerializer.new(object.set_games, each_serializer: V1::SetGameSerializer)
  end

  # Serialize the Player or Team id of the winner
  #
  # * *Returns* : Player id or Team id or nil
  #
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
