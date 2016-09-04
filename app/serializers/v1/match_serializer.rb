# Serialize a match with the following attributes:
# * +:id+
# * +:title+
# * +:scoring+ kind
# * +:doubles+
# * +:state+
# * +:winner+
# * +:first_team+ (when doubles)
# * +:second_team+ (when doubles)
# * +:first_player+ (when not doubles)
# * +:second_player+ (when not doubles)
#
class V1::MatchSerializer < V1::ApplicationSerializer
  attributes :id, :title, :scoring, :doubles, :state, :winner

  # Serialize the player or team id of the match winner,
  # if any.
  #
  # * *Returns* : id
  #
  def winner
    if object.team_winner.nil?
      nil
    else
      opponent_id object.team_winner
    end
  end

  # Indicate dynamic attributes to the serializer.  For a doubles match,
  # serialize first and second players.  For a singles match, serialize the first
  # and second teams.
  #
  # * *Returns* : Hash of attributes
  #
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

  # Serialize the first player
  #
  # * *Returns* : V1::PlayerSerializer
  #
  def first_player
    V1::PlayerSerializer.new(object.first_team.first_player)
  end

  # Serialize the first team
  #
  # * *Returns* : V1::TeamSerializer
  #
  def first_team
    V1::TeamSerializer.new(object.first_team)
  end

  # Serialize the second player
  #
  # * *Returns* : See V1::PlayerSerializer
  #
  def second_player
    V1::PlayerSerializer.new(object.second_team.first_player)
  end

  # Serialize the second team.  See V1::OpponentTeamSerializer.
  #
  # * *Returns* : V1::TeamSerializer
  #
  def second_team
    V1::TeamSerializer.new(object.second_team)
  end

  protected

  # Get the id for an opponent in a match.
  # For a doubles match, get a team id.  For a singles match,
  # get a player id
  # * *Args*    :
  #   - +team+ -> team opponent
  # * *Returns* : id
  def opponent_id(team)
    if object.doubles
      team.id
    else
      team.first_player.id
    end
  end

end
