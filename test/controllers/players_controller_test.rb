require 'test_helper'


# Test players_controller.
# This controller creates, lists, shows, edits and deletes players.
class PlayersControllerTest < ActionController::TestCase
  setup do
    @player = players(:orphan)
    # TODO: Login
    # session[:user_id] = users(:one).id
  end

  test 'should get index' do
    get :index
    assert_response :success
    assert_not_nil assigns(:players)
  end

  test "should create player" do
    assert_difference('Player.count') do
      post :create, player: { name: @player.name + 'a' } # unique name
    end

    assert_response 201
  end

  test 'should not allow duplicate player name' do
    assert_no_difference('Player.count') do
      post :create, player: { name: @player.name } # non-unique name
    end
    assert_response 422
  end

  test 'should not allow blank player name' do
    assert_no_difference('Player.count') do
      post :create, player: { name: '' } # non-unique name
    end
    assert_response 422
  end

  test 'should show player' do
    get :show, id: @player
    assert_response :success
  end

  test 'should update player' do
    patch :update, id: @player, player: { name: @player.name }
    assert_response 200
  end

  test 'should destroy player' do
    assert_difference('Player.count', -1) do
      delete :destroy, id: @player
    end
    assert_response 204
  end

  test 'should destroy singles team' do
    assert_difference('Team.count', 1) do
      @player.singles_team!
    end
    assert_difference('Team.count', -1) do
      delete :destroy, id: @player
    end

    assert_response 204
  end

  test 'should not destroy singles player in match' do
    assert_no_difference('Player.count') do
      delete :destroy,
             id: matches('m_one_eight_game_singles').first_singles_player
    end

    assert_response 422
  end

  test 'should not destroy doubles player in match' do
    assert_no_difference('Player.count') do
      delete :destroy,
             id: matches('m_one_eight_game_doubles').first_team.first_player
    end

    assert_response 422
  end

  test 'should not destroy player on team' do
    assert_no_difference('Player.count') do
      delete :destroy, id: teams('orphan').first_player
    end

    assert_response 422
  end
end

