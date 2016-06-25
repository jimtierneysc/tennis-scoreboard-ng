class UserSerializer < ActiveModel::Serializer
  attributes :id, :username, :auth_token

end
