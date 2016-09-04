# Controller for players
#
# * Renders a list of all players
# * Renders one player
# * Creates a new player
# * Updates a player
# * Deletes a player
# Players may not be deleted if they are in a match or
# on a team
#
class V1::PlayersController < ApplicationController
  before_action :authorize_user!, only: [:update, :create, :destroy]
  before_action :set_player, only: [:show, :update, :destroy]

  # Get a list of all players,
  # sorted by player name
  # * *Response*
  #   * List of players
  def index
    @players = Player.order 'lower(name)'
    render json: @players, serializer: V1::ApplicationArraySerializer
  end

  # Get a particular player
  # * *Params*
  #   * +:id+ - player id
  # * *Response*
  #   * Player
  def show
    render json: @player
  end

  # Create a player
  # * *Request*
  #   * +:name+ - player name
  # * *Response*
  #   * Player or HTTP error
  def create
    @player = Player.new(player_params)

    if @player.save
      render json: @player, status: :created, location: @player
    else
      render json: {errors: @player.errors}, status: :unprocessable_entity
    end
  end

  # Update a player
  # * *Params*
  #   * +:id+ - player id
  # * *Request*
  #   * +:name+ - different player name
  # * *Response*
  #   * Player or HTTP error
  def update
    if @player.update(player_params)
      render json: @player, status: :ok
    else
      render json: {errors: @player.errors}, status: :unprocessable_entity
    end
  end

  # Delete a player
  # A player in a match or on a team may not be
  # deleted.
  # * *Params*
  #   * +:id+ - player id
  # * *Response*
  #   * +:no_content+ or HTTP error
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
