# Model for a player.
# A player may be on a doubles team.
# A player may be on a "singles team".
# A singles team is a special kind of team to represent
# a player in a singles match.
# A player may be the first or second server in a match.
# A player may be the winner of a game.
class Player < ActiveRecord::Base
  validates :name, presence: true
  validates_uniqueness_of :name
  before_destroy :that_can_destroy

  def singles_team
    Team.find_by_doubles_and_first_player_id(false, self.id)
  end

  # Force a player to have a unique singles team
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
      errors.add :base, 'Cannot delete a player in a match or on a team'
      return false
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
