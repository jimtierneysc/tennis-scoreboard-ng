# Serialize a player with the following attributes:
# * +:id+
# * +:name+
#
class V1::PlayerSerializer < ActiveModel::Serializer
  attributes :id, :name

end
