require 'test_helper'

# Test the Match model.
# matches persist a information about a match, including
# the opponent teams, title and scoring.
class MatchTest < ActiveSupport::TestCase
  setup do
    @doubles_match = matches(:m_two_six_game_ten_point_doubles)
    @singles_match = matches(:m_two_six_game_ten_point_singles)
  end

  attr_reader :singles_match
  attr_reader :doubles_match

  test 'should not allow duplicate title' do
    doubles_match.title = singles_match.title
    refute doubles_match.valid?
  end

  test 'should not be complete by default' do
    refute doubles_match.completed?
  end

  test 'should require scoring' do
    doubles_match.scoring = nil
    refute doubles_match.valid?
  end

  test 'should require valid scoring' do
    doubles_match.scoring = 'abc'
    refute doubles_match.valid?
  end

  test 'should require first team' do
    doubles_match.first_team = nil
    refute doubles_match.valid?
  end

  test 'should require second team' do
    doubles_match.second_team = nil
    refute doubles_match.valid?
  end

  test 'should require first player' do
    singles_match.first_singles_player = nil
    refute singles_match.valid?
  end

  test 'should require second player' do
    singles_match.second_singles_player = nil
    refute singles_match.valid?
  end

  test 'should allow required fields by validators' do
    assert singles_match.valid?
    assert doubles_match.valid?
  end

  test 'should require scoring by validator' do
    doubles_match.scoring = nil
    assert_not doubles_match.valid?
  end
end