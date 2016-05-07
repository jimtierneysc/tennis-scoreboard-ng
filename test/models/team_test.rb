require 'test_helper'

# Test the Team model.
# The Team model is used to persist two different kinds
# of teams.  Doubles teams are added by the user, and may
# be opponents in doubles matches.  Each
# double team has two players.  The other kind of team is
# a team of one that represents a player in a singles match.
class TeamTest < ActiveSupport::TestCase
  def setup
    @team = Team.new first_player: players(:one)
  end

  attr_reader :team

  test 'should allow required fields' do
    assert team.valid?
  end

  test 'should require player' do
    team.first_player = nil
    refute team.valid?
  end

  test 'should allow required fields by validators' do
    assert team.valid?
  end

  test 'should require player by validator' do
    team.first_player = nil
    assert_not team.valid?
  end

  test 'that cannot delete match referenced team' do
    match = matches(:m_two_six_game_ten_point_singles)
    first_team = match.first_team
    assert_raises ActiveRecord::RecordNotDestroyed do
      first_team.destroy!
    end
  end

  def save_teams_with_same_name(name)
    (0..1).each do
      new_team = team.dup
      new_team.name = name
      new_team.save!
    end
  end

  test 'that can save duplicate nil team names' do
    save_teams_with_same_name(nil)
  end

  test 'that cannot save duplicate team names' do
    assert_raises ActiveRecord::RecordInvalid do
      save_teams_with_same_name('a')
    end
  end

  test 'that cannot have two doubles teams with same players' do
    team_one = teams(:one)
    team_one.first_player = teams(:two).first_player
    team_one.second_player = teams(:two).second_player
    refute team_one.valid?
    team_one.first_player = teams(:two).second_player
    team_one.second_player = teams(:two).first_player
    refute team_one.valid?
  end

  test 'that cannot have doubles team with one player' do
    team_one = teams(:one)
    team_one.first_player = teams(:two).first_player
    team_one.second_player = teams(:two).first_player
    refute team_one.valid?
  end

  test 'that can have singles and doubles teams with same player' do
    team_one = teams(:one)
    player = players(:orphan)
    # Create singles team
    player.singles_team!
    team_one.first_player = player
    team_one.second_player = teams(:two).first_player
    assert team_one.valid?
  end
end
