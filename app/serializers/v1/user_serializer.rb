# Serialize the current user with the following attributes:
# * +:id+
# * +:username+
#
class V1::UserSerializer < V1::ApplicationSerializer
  attributes :id, :username

end
