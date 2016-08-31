# Controller for teams
#
# * Renders a list of all teams
# * Renders a particular team
# * Creates a new team
# * Updates a team
# * Deletes a team
# Teams can not be deleted if they are in a match
#
class V1::TeamsController < ApplicationController
  before_action :authorize_user!,  only: [:update, :create, :destroy]
  before_action :set_team, only: [:show, :update, :destroy]

  # Get a list of all doubles teams,
  # sorted by team name.
  # Singles teams are for internal use so are
  # not shown to end users.
  # * *Response*
  #   * List of teams
  def index
    @teams = Team.where(doubles: true).order 'lower(name)'
    render json: @teams
  end

  # Get a particular team
  # * *Params*
  #   * +:id+ - team id
  # * *Response*
  #   * Team
  def show
    render json: @team
  end

  # Create a team
  # * *Request*
  #   * +:name+ - team name
  #   * +:first_player_id+ - first player on team
  #   * +:second_player_id+ - second player on team
  # * *Response*
  #   * Team
  def create
    json = team_params
    json[:doubles] = true
    @team = Team.new(json)

    if @team.save
      render json: @team, status: :created, location: @team
    else
      render json: {errors: @team.errors}, status: :unprocessable_entity
    end
  end

  # Update a team
  # * *Params*
  #   * +:id+ - team id
  # * *Request*
  #   * +:name+ - different team name
  #   * +:first_player_id+ - differnt first player
  #   * +:second_player_id+ - different second player
  # * *Response*
  #   * Team or HTTP error
  def update
    if @team.update(team_params)
      render json: @team, status: :ok
    else
      render json: {errors: @team.errors}, status: :unprocessable_entity
    end
  end

  # Delete a team
  # A team in a match omay not be
  # deleted
  # * *Params*
  #   * +:id+ - team id
  # * *Response*
  #   * +:no_content+ or HTTP error
  def destroy
    if @team.destroy
      head :no_content
    else
      render json: {errors: @team.errors}, status: :unprocessable_entity
    end
  end

  private

  def set_team
    @team = Team.find(params[:id])
  end

  def team_params
    params_var = params[:team].permit(:first_player_id,
                                              :second_player_id,
                                              :name)
    # team name may be nil
    params_var[:name] = nil if params_var[:name].blank?
    params_var
  end

end
