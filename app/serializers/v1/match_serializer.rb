class V1::MatchSerializer < ActiveModel::Serializer
  attributes :id, :title, :scoring, :doubles, :state, :winner

  def winner
    if object.team_winner.nil?
      nil
    else
      opponent_id object.team_winner
    end
  end

  def attributes
    data = super
    if object.doubles
      data[:first_team] = first_team
      data[:second_team] = second_team
    else
      data[:first_player] = first_player
      data[:second_player] = second_player
    end
    data
  end

  def first_player
    V1::PlayerSerializer.new(object.first_team.first_player, root: false)
  end

  def first_team
    V1::OpponentTeamSerializer.new(object.first_team, root: false)
  end

  def second_player
    V1::PlayerSerializer.new(object.second_team.first_player, root: false)
  end

  def second_team
    V1::OpponentTeamSerializer.new(object.second_team, root: false)
  end

  def opponent_id(team)
    if object.doubles
      team.id
    else
      team.first_player.id
    end
  end

end
