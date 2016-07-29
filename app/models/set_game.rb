# Model for a game
#
# Every game is in a set.
#
# Every game has an ordinal.  The first game in the set has ordinal 1.
#
# A game may have a winning team
#
# A tiebreaker is a special kind of game that occurs at the end of a set.
#
# Normal games have a serving player.  Tiebreakers do not have a serving player.
#
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

  def tiebreaker?
    tiebreaker
  end
end
