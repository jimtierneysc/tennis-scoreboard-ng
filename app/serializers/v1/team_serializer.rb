# Serialize a team with the following attributes:
# * +:id+
# * +:first_player+ See V1::PlayerSerializer
# * +:second_player+
#
class V1::TeamSerializer < V1::ApplicationSerializer
  attributes :id, :name, :first_player, :second_player
  # has_one :first_player
  # has_one :second_player

  # Serialize the first player on the team
  # * *Returns* : V1::PlayerSerializer
  def first_player
    V1::PlayerSerializer.new(object.first_player)
  end

  # Serialize the second player on the team
  # * *Returns* : V1::PlayerSerializer
  def second_player
    V1::PlayerSerializer.new(object.second_player)
  end

end
