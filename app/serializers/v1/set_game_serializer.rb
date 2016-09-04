# Serialize a game with the following attributes:
# * +:winner+ - Id of a team or a player
# * +:server+ - Id of a player
# * +:tiebreak+ - true if this game is a tiebreak
#
# Games are serialized with a set.   See
# V1::MatchSetSerializer.
#
class V1::SetGameSerializer < V1::ApplicationSerializer
  attributes :winner, :server, :tiebreak

  # Serialize the player or team id of the game winner,
  # if any.
  #
  # * *Returns* : id or nil
  #
  def winner
    if object.team_winner.nil?
      nil
    else
      if object.match_set.match.doubles
        object.team_winner.id
      else
        object.team_winner.first_player.id
      end
    end
  end

  # Indicate a tiebreak game.
  #
  # * *Returns* : true or nil
  #
  def tiebreak
    object.tiebreak? ? true : nil
  end

  # Serialize the playerid of the game server.
  # Tiebreak games do not have a server.
  #
  # * *Returns* : id or nil
  #
  def server
    object.player_server_id
  end

end
