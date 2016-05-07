require 'test_helper'

# Test the Player model.
# The Player model persists the names of players.
# A player may be on a doubles team.
# Also, when a player is an opponent in a singles match, each player
# will be represented by a team of one.
class PlayerTest < ActiveSupport::TestCase
  def setup
    @player = Player.new name: 'aname'
  end

  attr_reader :player

  test 'should allow required fields' do
    player.save!
  end

  test 'should require name' do
    player.name = nil
    refute player.valid?
  end

  test 'should not allow blank name' do
    player.name = ''
    refute player.valid?
  end

  test 'should not allow duplicate name' do
    player.name = players(:one).name
    refute player.valid?
  end

  test 'should allow required fields by validator' do
    assert player.valid?
  end

  test 'should require name by validator' do
    player.name = nil
    assert_not player.valid?
  end

  test 'should not allow duplicate name validate' do
    player.name = players(:one).name
    assert_not player.valid?
  end

  test 'should destroy singles team' do
    player.save!
    assert_difference('Team.count', 1) do
      player.singles_team!
    end
    assert_difference('Team.count', -1) do
      player.destroy!
    end
  end

  test 'that cannot delete team referenced player' do
    team = teams(:one)
    team.first_player = players(:orphan)
    team.save!
    first_player = team.first_player
    assert_raises ActiveRecord::RecordNotDestroyed do
      first_player.destroy!
    end
  end
end
