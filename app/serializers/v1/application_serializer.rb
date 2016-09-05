# Base class for this application's serializers.
# Disable JSON root object
class V1::ApplicationSerializer < ActiveModel::Serializer
  self.root = false

end
