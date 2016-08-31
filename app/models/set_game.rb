# Model for a game
#
# == Overview
#
# * A game belongs to a MatchSet
# * A game has a state:
#   * +:in_progress+
#   * +:finished+
# * A game has an ordinal.  The first game in the set has ordinal 1
# * A game may have a winning team
# * A game may be a tiebreak
# A tiebreak is a special kind of game that occurs at the end of a set
# * A non-tiebreak game has a serving player
#
# == Schema Information
#
# Table name: set_games
#
#  id               :integer          not null, primary key
#  ordinal          :integer          not null
#  match_set_id     :integer          not null
#  team_winner_id   :integer
#  created_at       :datetime         not null
#  updated_at       :datetime         not null
#  player_server_id :integer
#  tiebreaker       :boolean          default(FALSE), not null
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

  # Get the state of a game
  # * *Returns* : state
  #   * +:in_progress+ or
  #   * +:finished+
  def state
    team_winner_id ? :finished : :in_progress
  end

  # Indicate if the game is a tiebreak
  # * *Returns* : Boolean
  def tiebreak?
    tiebreaker
  end
end
