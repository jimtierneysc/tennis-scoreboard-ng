require 'test_helper'

# Test for the SetGame model.  There is not much here
# because games do not have meaning outside the
# context of a match. See the match tests.
class SetGameTest < ActiveSupport::TestCase
  def setup
    match = matches(:m_three_six_game_doubles).change_score! :start_play
    match.change_score! :start_next_set
    @game = match.change_score! :start_next_game
  end

  test 'should allow required fields' do
    assert @game.valid?
  end

  test 'should require set' do
    @game.match_set = nil
    refute @game.valid?
  end

  test 'should require ordinal' do
    @game.ordinal = nil
    refute @game.valid?
  end
end
