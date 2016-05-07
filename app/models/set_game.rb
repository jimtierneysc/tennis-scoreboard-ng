# Model for a game in a set (in a match).
# A game has a winning team (Even a singles player is represented using a team).
# A tiebreaker is a special kind of game that occurs at the end of a set.
# Normal games have a serving player.  Tiebreakers do not have a serving player.
# A game has an ordinal.  The first game in the set is ordinal 1.
class SetGame < ActiveRecord::Base
  belongs_to :match_set
  belongs_to :team_winner, class_name: 'Team', foreign_key: :team_winner_id
  belongs_to :player_server,
             class_name: 'Player', foreign_key: :player_server_id
  validates :ordinal, :match_set, presence: true
  default_scope { order('ordinal ASC') }
  after_save { match_set.score_changed }
  after_destroy { match_set.score_changed }

  def state
    team_winner_id ? :finished : :in_progress
  end

  # TODO: alias or alias_method?
  def tiebreaker?
    tiebreaker
  end

  def service_hold?
    raise Exceptions::InvalidOperation, 'No winner' unless team_winner
    raise Exceptions::InvalidOperation, 'No server' unless player_server
    raise Exception::InvalidOperation, 'Tiebreaker' if tiebreaker?
    team_winner.players.include? player_server
  end
end
