require 'test_helper'

# Test the match_score_board_controller
# This controller provides a representation of the match score and supports
# commands to change the score.
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

  def post_action(match, action, winner = nil)
    params = {action: action}
    params[:team] = winner.id if winner
    post :update, id: match, match_score_board: params
  end


  test 'should start play match' do
    match = matches(:m_two_six_game_ten_point_doubles)
    # post :startplay, id: match
    post_action match, :start_play
    match.reload
    assert_equal 1, match.match_sets.count
    assert_equal 6, match.first_set.win_threshold
  end

  test 'should discard play match' do
    match = matches(:m_two_six_game_ten_point_doubles).change_score! :start_play
    match.change_score! :start_next_set
    match.change_score! :start_next_game
    # post :discardplay, id: match
    post_action match, :discard_play
    match.reload
    assert_equal 0, match.match_sets.count
  end

  test 'should restart play match' do
    match = matches(:m_two_six_game_ten_point_doubles).change_score! :start_play
    match.change_score! :start_next_set
    match.change_score! :start_next_game
    # post :restartplay, id: match
    post_action match, :restart_play
    match.reload
    assert_equal 0, match.first_set.set_games.count
    assert match.change_score? :start_next_game
  end

  test 'should not complete match' do
    match = matches(:m_two_six_game_ten_point_doubles).change_score! :start_play
    # post :completeplay, id: match
    post_action match, :complete_play
    match.reload
    refute match.completed?
  end

  test 'should start set' do
    match = matches(:m_two_six_game_ten_point_doubles).change_score! :start_play
    # post :startset, id: match
    post_action match, :start_next_set
    match.reload
    assert match.first_set
  end

  test 'should discard set' do
    match = matches(:m_two_six_game_ten_point_doubles).change_score! :start_play
    match.change_score! :start_next_set
    # post :removelastchange, id: match
    post_action match, :remove_last_change
    match.reload
    assert_equal 0, match.match_sets.count
  end

  def do_get_to_tiebreaker(match)
    match.change_score! :start_next_set
    (1..match.last_set.win_threshold * 2).each do |ordinal|
      match.change_score! :start_next_game
      winner = ordinal.even? ? match.first_team : match.second_team
      match.change_score! :win_game, winner
    end
    assert match.change_score? :start_tiebreaker
    refute match.change_score? :win_tiebreaker
  end

  def do_win_set(match, winner)
    match.change_score! :start_next_set
    (1..match.last_set.win_threshold).each do
      match.change_score! :start_next_game
      match.change_score! :win_game, winner
    end
  end

  def do_get_to_match_tiebreaker(match)
    (1..match.min_sets_to_play).each do
      match.change_score! :start_next_set
      do_win_set match, if match.match_sets.count.even?
                          match.first_team
                        else
                          match.second_team
                        end
      match.change_score! :complete_set_play
    end
    assert match.change_score? :start_match_tiebreaker
  end

  test 'should start tiebreaker' do
    match = matches(:m_two_six_game_ten_point_doubles).change_score! :start_play
    do_get_to_tiebreaker match
    # post :starttiebreaker, id: match
    post_action match, :start_tiebreaker
    match.reload
    assert match.change_score? :win_tiebreaker
  end

  test 'should start match tiebreaker' do
    match = matches(:m_two_six_game_ten_point_doubles).change_score! :start_play
    do_get_to_match_tiebreaker match
    # post :startmatchtiebreaker, id: match
    post_action match, :start_match_tiebreaker
    match.reload
    assert match.change_score? :win_match_tiebreaker
    assert match.match_sets.count == 3
    assert match.last_set.tiebreaker?
    assert match.last_set.last_game.tiebreaker?
  end

  test 'should win match tiebreaker' do
    match = matches(:m_two_six_game_ten_point_doubles).change_score! :start_play
    do_get_to_match_tiebreaker match
    match.change_score! :start_match_tiebreaker
    assert match.change_score? :win_match_tiebreaker
    assert match.match_sets.count == 3
    # post :winmatchtiebreaker, id: match, team_id: match.first_team
    post_action match, :win_match_tiebreaker, match.first_team
    match.reload
    refute match.change_score? :win_match_tiebreaker
    assert match.match_sets.count == 3
  end

  test 'should start first game' do
    match = matches(:m_two_six_game_ten_point_doubles).change_score! :start_play
    match.change_score! :start_next_set
    match.apply_first_or_second_player_server match.first_team.first_player
    # post :startgame, id: match
    post_action match, :start_next_game
    match.reload
    assert_equal 1, match.first_set.set_games.count
  end

  test 'should create match player servers' do
    match = matches(:m_two_six_game_ten_point_doubles).change_score! :start_play
    match.change_score! :start_next_set
    first_server = match.first_team.first_player
    second_server = match.second_team.first_player
    match.change_score! :start_next_game
    assert_equal 1, match.first_set.set_games.count
    assert_equal first_server, match.first_player_server
    match.change_score! :win_game, match.first_team
    match.reload
    assert_equal 1, match.first_set.set_games.count
    assert_equal second_server, match.second_player_server
  end

  test 'should win first game' do
    match = matches(:m_two_six_game_ten_point_doubles).change_score! :start_play
    match.change_score! :start_next_set
    match.change_score! :start_next_game
    winner = match.first_team
    # post :wingame, id: match, team_id: winner
    post_action match, :win_game, winner
    match.reload
    assert_equal winner, match.first_set.set_games.first.team_winner
  end

end
