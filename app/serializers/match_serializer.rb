class MatchSerializer < ActiveModel::Serializer
  attributes :id, :title, :scoring, :doubles, :state, :winner

  def status
    # not_started, in-progress, finished, etc.
    object.state
  end

  def winner
    unless object.team_winner.nil?
      if object.doubles
        object.team_winner.id
      else
        object.team_winner.first_player.id
      end
    else
      nil
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
    PlayerSerializer.new(object.first_team.first_player, root: false)
  end

  def first_team
    OpponentTeamSerializer.new(object.first_team, root: false)
  end

  def second_player
    PlayerSerializer.new(object.second_team.first_player, root: false)
  end

  def second_team
    OpponentTeamSerializer.new(object.second_team, root: false)
  end

end
