class TeamSerializer < ActiveModel::Serializer
  attributes :id, :name
  has_one :first_player
  has_one :second_player
end
