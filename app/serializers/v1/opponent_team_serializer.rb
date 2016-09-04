# Serialize a team in a match:
# * +:id+
# * +:name+
# * +:first_player+
# * +:second_player+
#
# The opponent teams are serialized with the match scoreboard.   See
# V1::MatchScoreboardSerializer.
#
class V1::OpponentTeamSerializer < ActiveModel::Serializer
  attributes :id, :name, :first_player, :second_player

  # Serialize the first player on the team
  # * *Returns* : V1::PlayerSerializer
  def first_player
    V1::PlayerSerializer.new(object.first_player, root: false)
  end

  # Serialize the second player on the team
  # * *Returns* : V1::PlayerSerializer
  def second_player
    V1::PlayerSerializer.new(object.second_player, root: false)
  end
end
