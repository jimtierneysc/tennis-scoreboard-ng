# Controller for players
# Renders a list of players.
# Renders a single player
# Creates a new player.
# Updates a player.
# Deletes a player.
class V1::PlayersController < ApplicationController
  before_action :authorize_user!, only: [:update, :create, :destroy]
  before_action :set_player, only: [:show, :update, :destroy]

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
      render json: {errors: @player.errors}, status: :unprocessable_entity
    end
  end

  # PATCH/PUT /players/1
  def update
    if @player.update(player_params)
      render json: @player, status: :ok
    else
      render json: {errors: @player.errors}, status: :unprocessable_entity
    end
  end

  # DELETE /players/1
  def destroy
    if @player.destroy
      head :no_content
    else
      render json: {errors: @player.errors}, status: :unprocessable_entity
    end
  end

  private

  def set_player
    @player = Player.find(params[:id])
  end

  def player_params
    params[:player].permit :name
  end

end
