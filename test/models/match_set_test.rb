require 'test_helper'

# Test for the MatchSet model.  There is not much here
# because sets do not have meaning outside the
# context of a match. See the match tests.
class MatchSetTest < ActiveSupport::TestCase
  def setup
    @set = MatchSet.new(
      match_id: matches(:m_three_six_game_doubles).id,
      scoring: :six_game,
      ordinal: 1)
  end

  attr_reader :set

  test 'should not have default false booleans' do
    set.save!
    refute set.completed?
  end

  test 'should allow required fields' do
    set.save!
  end

  test 'should require match' do
    set.match_id = nil
    refute set.valid?
  end

  test 'should require scoring' do
    set = @set
    set.scoring = nil
    refute set.valid?
  end

  test 'should require ordinal' do
    set.ordinal = nil
    refute set.valid?
  end
end
