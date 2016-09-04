# Serialize a player with the following attributes:
# * +:id+
# * +:name+
#
class V1::PlayerSerializer < V1::ApplicationSerializer
  attributes :id, :name

end
