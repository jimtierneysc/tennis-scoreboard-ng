# Controller for teams
# Renders a list of teams.
# Shows individual teams.
# Creates a new team.
# Updates a team.
# Deletes a team.
class TeamsController < ApplicationController
  rescue_from ::ActiveRecord::RecordNotFound, with: :when_record_not_found
  before_action :set_team, only: [:show, :update, :destroy]
  # TODO: Require login
  # before_action :check_login, only:
  #   [:update, :create, :destroy]

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
      render json: @team.errors, status: :unprocessable_entity
    end
  end

  # PATCH/PUT /teams/1
  def update
    if @team.update(team_params)
      render json: @team, status: :ok
    else
      render json: @team.errors, status: :unprocessable_entity
    end
  end

  # DELETE /teams/1
  def destroy
    if @team.destroy
      head :no_content
    else
      render json: @team.errors, status: :unprocessable_entity
    end
  end

  private

  def set_team
    @team = Team.find(params[:id])
  end

  # def team_params
  #   params[:team].permit :name
  # end
  #
  def team_params
    params_var = params.require(:team).permit(:first_player_id,
                                              :second_player_id,
                                              :name)
    # team name may be nil
    params_var[:name] = nil if params_var[:name].blank?
    params_var
  end

  # Handle record not found exception
  def when_record_not_found
    render json: { error: 'Not found' }, status: :not_found
  end

  # TODO: Make sure that exception does not cause html response
  # def when_other_error
  #   render json: { error: 'Something went wrong' }, status: :internal_server_error
  # end
end
