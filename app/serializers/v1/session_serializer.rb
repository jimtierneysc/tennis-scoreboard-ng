# Serialize a user, that has been logged in, with following attributes:
# * +:id+
# * +:username+
# * +:auth_token+
#
class V1::SessionSerializer < V1::ApplicationSerializer
  attributes :id, :username, :auth_token
end
