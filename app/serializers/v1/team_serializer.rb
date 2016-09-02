# Serialize a team with the following attributes:
# * +:id+
# * +:first_player+ See V1::PlayerSerializer
# * +:second_player+
#
class V1::TeamSerializer < ActiveModel::Serializer
  attributes :id, :name
  has_one :first_player
  has_one :second_player
end
