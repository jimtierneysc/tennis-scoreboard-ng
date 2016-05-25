require 'test_helper'

# Test matches_controller.
# This controller creates, lists, shows, edits and deletes matches.
# There are two different kinds of matches: singles and doubles.
class MatchesControllerTest < ActionController::TestCase
  def setup
    @singles_match = matches(:m_three_six_game_singles)
    @doubles_match = matches(:m_three_six_game_doubles)
    session[:user_id] = users(:one).id
  end

  attr_reader :singles_match
  attr_reader :doubles_match

  test 'routing' do
    assert_routing 'api/matches', controller: 'matches', action: 'index'
    assert_routing 'api/matches/1', controller: 'matches', action: 'show', id: "1"
    assert_routing({ method: 'put', path: '/api/matches/1' }, { controller: "matches", action: "update", id: "1" })
    assert_routing({ method: 'post', path: '/api/matches' }, { controller: "matches", action: "create" })
    assert_routing({ method: 'delete', path: '/api/matches/1' }, { controller: "matches", action: "destroy", id: "1" })
  end


  test 'should get index' do
    get :index
    assert_response :success
    assert_not_nil assigns(:matches)
  end

  test 'should not allow duplicate match title' do
    assert_no_difference('Match.count') do
      post :create, match: singlesmatch_properties(singles_match)
    end
    assert_response 422
  end

  def match_properties(match)
    {
      title: match.title,
      doubles: match.doubles,
      scoring: match.scoring
    }
  end

  def singlesmatch_properties(match)
    match_properties(match).merge(
      first_player_id: match.first_singles_player.id,
      second_player_id: match.second_singles_player.id)
  end

  def doublesmatch_properties(match)
    match_properties(match).merge(
      first_team_id: match.first_team.id,
      second_team_id: match.second_team.id)
  end

  test 'should create singles match' do
    match = singles_match
    match.title = 'a' # unique
    assert_difference('Match.count') do
      post :create, match: singlesmatch_properties(match)
    end
    assert_response 201
  end

  test 'should create doubles match' do
    match = doubles_match
    match.title = 'a' # unique
    assert_difference('Match.count') do
      post :create, match: doublesmatch_properties(match)
    end
    assert_response 201
  end

  test 'should show match' do
    match = singles_match
    get :show, id: match
    assert_response :success
  end

  test 'should update singles match' do
    match = singles_match
    patch :update, id: match, match: singlesmatch_properties(match)
    assert_response :success
  end

  test 'should update doubles match' do
    match = singles_match
    patch :update, id: match, match: doublesmatch_properties(match)
    assert_response :success
  end

  test 'should destroy match' do
    match = singles_match
    assert_difference('Match.count', -1) do
      delete :destroy, id: match
    end

    assert_response 204
  end

  def only_players(count)
    Match.delete_all # must delete references to teams
    Team.delete_all # must delete references to players
    Player.delete_all
    1.upto(count) do |i|
      Player.new(name: i.to_s).save!
    end
  end

  # TODO: Implement logic in client
  # test 'cannot create singles match when zero players' do
  #   only_players(0)
  #   get :new
  #   assert flash[:alert]
  # end
  #
  # test 'cannot create singles match when one players' do
  #   only_players(1)
  #   get :new
  #   assert flash[:alert]
  # end
  #
  # test 'can create singles match when two players' do
  #   only_players(2)
  #   get :new
  #   refute flash[:alert]
  # end

  # Clear all matches and teams. Create "count" teams.
  def only_teams(count)
    Match.delete_all
    Team.delete_all
    player_id_list = []
    [:one, :two, :three, :four].each { |sym| player_id_list << players(sym).id }
    1.upto(count) do
      Team.new(doubles: true,
               first_player_id: player_id_list[0],
               second_player_id: player_id_list[1]).save!
      player_id_list.rotate!
    end
  end

  # TODO: Implement logic in client
  # test 'cannot create doubles match when zero teams' do
  #   only_teams(0)
  #   get :newdoubles
  #   assert flash[:alert]
  # end
  #
  # test 'cannot create doubles match when one team' do
  #   only_teams(1)
  #   get :newdoubles
  #   assert flash[:alert]
  # end
  #
  # test 'can create doubles match when two teams' do
  #   only_teams(2)
  #   get :newdoubles
  #   refute flash[:alert]
  # end
end
