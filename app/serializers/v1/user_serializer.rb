# Serialize the current user with the following attributes:
# * +:id+
# * +:username+
#
class V1::UserSerializer < ActiveModel::Serializer
  attributes :id, :username

end
