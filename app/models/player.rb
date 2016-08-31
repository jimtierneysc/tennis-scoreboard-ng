# Model for a player
# == Overview
# * A player may be on a team
# * A player may be the first or second server in a match
# * A player may be the server of a game
#
# == Schema Information
#
# Table name: players
#
#  id         :integer          not null, primary key
#  name       :string           not null
#  created_at :datetime         not null
#  updated_at :datetime         not null
#
class Player < ActiveRecord::Base
  validates :name, presence: true
  validates_uniqueness_of :name
  before_destroy :that_can_destroy

  # Find the singles team associated with this player
  # * *Returns* : Team or nil
  def singles_team
    Team.find_by_doubles_and_first_player_id(false, self.id)
  end

  # Force a player to have an associated singles team.  Create a new
  # Team if needed.
  # * *Returns* : Team
  def singles_team!
    team = singles_team
    unless team
      team = Team.new
      team.doubles = false
      team.first_player = self
      team.save!
    end
    team
  end

  private

  def that_can_destroy
    clean_singles_team
    if on_any_team?
      errors.add :errors, 'Can\'t delete a player in a match or on a team'
      false
    end
  end

  def on_any_team?
    Team.where('first_player_id=? OR second_player_id=?', id, id).exists?
  end

  def clean_singles_team
    team = singles_team
    if team
      unless Match.where('first_team_id=? OR second_team_id=?',
                         team.id, team.id).exists?
        team.destroy!
      end
    end
  end
end
