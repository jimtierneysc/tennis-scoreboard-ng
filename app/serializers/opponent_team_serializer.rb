class OpponentTeamSerializer < ActiveModel::Serializer
  attributes :id, :name, :first_player, :second_player

  def first_player
    PlayerSerializer.new(object.first_player, root: false)
  end

  def second_player
    PlayerSerializer.new(object.second_player, root: false)
  end
end
