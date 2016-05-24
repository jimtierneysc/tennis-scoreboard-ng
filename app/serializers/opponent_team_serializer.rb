class OpponentTeamSerializer < ActiveModel::Serializer
  attributes :id, :name, :first_player_name, :second_player_name

  def first_player_name
    object.first_player.name
    end

  def second_player_name
    object.second_player.name
  end
end
