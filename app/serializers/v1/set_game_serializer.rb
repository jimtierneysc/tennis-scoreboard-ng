# Serializes a SetGame with the following attributes:
# * +:winner+ - Id of a Team or a Player
# * +:server+ - Id of a Player
# * +:tiebreak+ - true if this game is a tiebreak
#
class V1::SetGameSerializer < V1::ApplicationSerializer
  attributes :winner, :server, :tiebreak

  # Serialize the Player or Team id of the game winner
  #
  # * *Returns* : Team id or Player id or nil
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

  # Indicate a tiebreak game
  #
  # * *Returns* : true or nil
  #
  def tiebreak
    object.tiebreak? ? true : nil
  end

  # Serialize the Player id of the game server.
  #
  # * *Returns* : Player id or nil
  #
  def server
    object.player_server_id
  end

end
