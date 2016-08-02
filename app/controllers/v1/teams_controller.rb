# Controller for teams
# Renders a list of teams.
# Renders a single team.
# Creates a new team.
# Updates a team.
# Deletes a team.
class V1::TeamsController < ApplicationController
  before_action :check_login!, only:
    [:update, :create, :destroy]
  before_action :set_team, only: [:show, :update, :destroy]

  # GET /teams
  def index
    @teams = Team.where(doubles: true).order 'lower(name)'
    render json: @teams
  end

  # GET /teams/1
  def show
    render json: @team
  end

  # POST /teams
  # POST /teams.json
  def create
    json = team_params
    json[:doubles] = true;
    @team = Team.new(json)

    if @team.save
      render json: @team, status: :created, location: @team
    else
      render json: {errors: @team.errors}, status: :unprocessable_entity
    end
  end

  # PATCH/PUT /teams/1
  def update
    if @team.update(team_params)
      render json: @team, status: :ok
    else
      render json: {errors: @team.errors}, status: :unprocessable_entity
    end
  end

  # DELETE /teams/1
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
