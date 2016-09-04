# Serialize a set with the following attributes:
# * +:scoring+ kind
# * +:state+
# * +:winner+
# * +:games+ See V1::SetGameSerializer.
#
# Sets are serialized with a match scoreboard.   See
# V1::MatchScoreboardSerializer.
#
class V1::MatchSetSerializer < ActiveModel::Serializer
  attributes :scoring, :winner, :games, :state

  # Serialize the games of the set. See
  # V1::SetGameSerializer
  #
  # * *Returns* :
  #   - array of V1::SetGameSerializer
  #
  def games
    ActiveModel::ArraySerializer.new(object.set_games, each_serializer: V1::SetGameSerializer)
  end

  # Serialize the player or team id of the set winner,
  # if any.
  #
  # * *Returns* : id
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
