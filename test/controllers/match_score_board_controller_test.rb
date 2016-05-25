require 'test_helper'

# Test the match_score_board_controller
# This controller shows a read only representation of a match score.
class MatchScoreBoardControllerTest < ActionController::TestCase
  def setup
    @match = matches(:m_three_six_game_singles)
    # session[:user_id] = users(:one).id
  end

  test 'routing' do
    assert_routing 'api/match_score_board/1', controller: 'match_score_board', action: 'show', id: '1'
  end

  test 'should show match' do
    get :show, id: @match
    assert_response :success
  end
end
