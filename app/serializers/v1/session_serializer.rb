# Serializes a logged in User.  The following attributes
# are serialized:
# * +:id+
# * +:username+
# * +:auth_token+
#
class V1::SessionSerializer < V1::ApplicationSerializer
  attributes :id, :username, :auth_token
end
