# Controller for players
# Renders a list of players.
# Shows individual players.
# Creates a new player.
# Updates a player.
# Deletes a player.
class PlayersController < ApplicationController
  rescue_from ::ActiveRecord::RecordNotFound, with: :when_record_not_found
  before_action :set_player, only: [:show, :update, :destroy]
  # TODO: Require login
  # before_action :check_login, only:
  #   [:update, :create, :destroy]

  # GET /players
  def index
    @players = Player.order 'lower(name)'
    render json: @players
  end

  # GET /players/1
  def show
    render json: @player
  end

  # POST /players
  # POST /players.json
  def create
    @player = Player.new(player_params)

    if @player.save
      render json: @player, status: :created, location: @player
    else
      render json: @player.errors, status: :unprocessable_entity
    end
  end

  # PATCH/PUT /players/1
  def update
    if @player.update(player_params)
      head :no_content
    else
      render json: @player.errors, status: :unprocessable_entity
    end
  end

  # DELETE /players/1
    def destroy
      @player.destroy

      head :no_content
    end

  private

  def set_player
    @player = Player.find(params[:id])
  end

  def player_params
    params.require(:player).permit(:name, :team_id)
  end

  # Handle record not found exception
  def when_record_not_found
    render json: 'Not found', status: :not_found
  end
end
