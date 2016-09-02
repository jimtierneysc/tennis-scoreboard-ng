# Model for a team
#
# == Overview
#
# * A team may be an opponent in a match
# * A team may be the winner of a game, a match or a set
# * A doubles team has two players
# * A singles team has one player
# Singles teams are created as needed to allow a
# player to be an opponent in a match.
#
# == Schema Information
#
# Table name: teams
#
#  id               :integer          not null, primary key
#  name             :string
#  first_player_id  :integer          not null
#  second_player_id :integer
#  created_at       :datetime         not null
#  updated_at       :datetime         not null
#  doubles          :boolean          default(FALSE), not null
#
class Team < ActiveRecord::Base
  belongs_to :first_player,
             class_name: 'Player', foreign_key: :first_player_id
  belongs_to :second_player,
             class_name: 'Player', foreign_key: :second_player_id
  before_validation { self.name = nil if self.name.blank? }
  # redundant
  # validates :first_player_id, presence: true
  validates_uniqueness_of :name, allow_nil: true
  validate :that_is_valid_first_player
  validate :that_is_valid_second_player
  validate :that_is_unique_player_pair
  validate :that_can_change_player
  before_destroy :that_can_destroy_team

  # If a name is not provided when match is created, generate name
  before_create { self.name = next_team_name if self.doubles && self.name.blank? }

  # Indicate whether team includes all players in a list
  # * *Args*    :
  #   - +players+ -> array of players
  # * *Returns* : Boolean
  def include_players?(players)
    players == [first_player, second_player] & players.compact
  end

  # Indicate whether team includes a particular player
  # * *Args*    :
  #   - +player+ -> Player
  # * *Returns* : Boolean
  def include_player?(player)
    include_players?([player])
  end

  private

  def that_can_destroy_team
    if team_in_match?
      errors.add :errors, 'Can\'t delete a team in a match'
      false # discard destroy
    end
  end

  def that_can_change_player
    first_changed = first_player_id_changed?
    second_changed = second_player_id_changed?
    if (first_changed || second_changed) and team_playing_match?
      message = 'can\'t be changed when in a match that has started'
      errors.add :first_player, message if first_changed
      errors.add :second_player, message if second_changed
    end
  end

  def team_playing_match?
    matches_of_team.where('started').exists?
  end

  def team_in_match?
    matches_of_team.exists?
  end

  def matches_of_team
    Match.where('first_team_id=? OR second_team_id=?', id, id)
  end

  def that_is_valid_first_player
    if first_player.nil?
      errors.add(:first_player, if first_player_id.blank?
                                  'can\'t be blank'
                                else
                                  'not found'
                                end)
    end
  end

  def that_is_valid_second_player
    if doubles
      if second_player.nil?
        errors.add(:second_player, if second_player_id.blank?
                                     'must be specified'
                                   else
                                     'not found'
                                   end)
      else
        errors.add(:second_player, 'must not be the same as first player') if second_player == first_player
      end
    else
      # not doubles
      errors.add(:second_player, 'not allowed') if second_player
    end
  end

  def that_is_unique_player_pair
    if doubles && first_player_id && second_player_id
      player_ids = [first_player_id, second_player_id]
      existing_team = Team.where(first_player_id: player_ids)
                        .where(second_player_id: player_ids).first
      unless existing_team.nil? || existing_team.id == self.id
        errors.add(:error, 'A team with these players already exists')
      end
    end
  end

  # Generate a unique title for a team
  def next_team_name
    "Team#{next_team_number}"
  end

  # Get a unique number to use when generating a team title
  def next_team_number
    # This returns a PGresult object
    # [http://rubydoc.info/github/ged/ruby-pg/master/PGresult]
    result = Team.connection.execute("SELECT nextval('team_number_seq')")
    result[0]['nextval']
  end
end
