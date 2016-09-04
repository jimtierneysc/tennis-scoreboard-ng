# Base class for this application's serializers
# Disable JSON root object
class V1::ApplicationArraySerializer < ActiveModel::ArraySerializer
  self.root = false

end
