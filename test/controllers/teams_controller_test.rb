require 'test_helper'


# Test teams_controller.
# This controller creates, lists, shows, edits and deletes teams.
class TeamsControllerTest < ActionController::TestCase
  setup do
    @team = teams(:orphan)
    # TODO: Login
    # session[:user_id] = users(:one).id
  end

  test 'should get index' do
    get :index
    assert_response :success
    assert_not_nil assigns(:teams)
  end

  def team_parameters(name)
    {
      name: name,
      doubles: true,
      first_player_id: players(:two).id,
      second_player_id: players(:four).id
    }
  end

  test "should create team" do
    assert_difference('Team.count') do
      post :create, team: team_parameters('a')
    end

    assert_response 201
  end

  test 'should allow blank team name' do
    assert_difference('Team.count') do
      post :create, team: team_parameters('')
    end

    assert_response 201
  end

  test 'should allow duplicate null team name' do
    team = Team.new team_parameters(nil)
    team.first_player = players(:orphan)
    team.save!
    assert_difference('Team.count') do
      post :create, team: team_parameters(nil)
    end
    assert_response 201
  end

  test 'should not allow duplicate team name' do
    assert_no_difference('Team.count') do
      post :create, team: { name: @team.name } # non-unique name
    end
    assert_response 422
  end

  test 'should show team' do
    get :show, id: @team
    assert_response :success
  end

  test 'should update team' do
    patch :update, id: @team, team: { first_player_id: players(:two) }
    assert_response 204
  end

  test 'should destroy team' do
    assert_difference('Team.count', -1) do
      delete :destroy, id: @team
    end
    assert_response 204
  end


  test 'should not destroy doubles team in match' do
    assert_no_difference('Team.count') do
      delete :destroy, id: matches('m_one_eight_game_doubles').first_team
    end

    assert_response 422
  end

  # TODO: Validate these cases using jasmine front-end unit tests
  # def only_players(count)
  #   Match.delete_all # must delete references to teams
  #   Team.delete_all # must delete references to players
  #   Player.delete_all
  #   1.upto(count) do |i|
  #     Player.new(name: i.to_s).save!
  #   end
  # end
  #
  # test 'that cannot create team when zero players' do
  #   only_players(0)
  #   get :new
  #   assert flash[:alert]
  # end
  #
  # test 'that cannot create team when one player' do
  #   only_players(1)
  #   get :new
  #   assert flash[:alert]
  # end
  #
  # test 'that can create team when two players' do
  #   only_players(2)
  #   get :new
  #   refute flash[:alert]
  # end


end

