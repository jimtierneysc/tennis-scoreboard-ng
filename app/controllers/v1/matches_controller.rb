# Controller for matches.
# Renders a list of matches.
# Renders a single match.
# Creates new doubles matches and new singles matches.
# Updates a match.
# Deletes a match.
class V1::MatchesController < ApplicationController
  before_action :check_login!, only: [:create, :update, :destroy]
  before_action :set_match, only:
    [:show, :update, :destroy]

  @match = nil
  # GET /matches
  def index
    @matches = Match.order 'lower(title)'
    render json: @matches
  end

  # GET /matches/1
  def show
    render json: @match
  end

  # POST /matches
  def create
    @match = create_match
    if @match.save
      render json: @match, status: :created, location: @match
    else
      render json: { errors: @match.errors }, status: :unprocessable_entity
    end
  end

  # PATCH/PUT /matches/1
  def update
    doubles = match_params_doubles?(@match.doubles)
    update_sym = if doubles
                   :update_doubles_match
                 else
                   :update_singles_match
                 end
    if send(update_sym, @match, match_params(doubles))
      render json: @match, status: :ok
    else
      render json: { errors: @match.errors }, status: :unprocessable_entity
    end
  end

  # DELETE /matches/1
  def destroy
    @match.destroy
    head :no_content
  end

  private

  # Opponents for a doubles match and for a singles match are different.
  # Singles match has players.  Doubles match has teams.
  def match_params(doubles)
    params_var = params_require
    permit = [:title, :scoring, :doubles]
    permit += if doubles
                [:first_team_id, :second_team_id]
              else
                [:first_player_id, :second_player_id]
              end
    params_var.permit(permit)
  end

  def match_params_doubles?(default_value=false)
    exists_doubles_param? ? doubles_param? : default_value
  end

  def params_require
    params.require :match
  end

  def doubles_param?
    params_require[:doubles].to_s == 'true'
  end

  def exists_doubles_param?
    !params_require[:doubles].nil?
  end

  def set_match
    @match = Match.find(params[:id])
  end

  # Handle record not found exception
  def when_record_not_found
    render json: { errors: 'Not found' }, status: :not_found
  end

  def create_doubles_match(params_var)
    Match.new params_var
  end

  def update_doubles_match(match, params_var)
    match.update params_var
  end

  def create_match
    doubles = match_params_doubles?
    params_var = match_params(doubles)
    if doubles
      create_doubles_match params_var
    else
      create_singles_match params_var
    end
  end

  def create_singles_match(params_var)
    Match.new player_ids_to_team_ids(params_var)
  end

  def update_singles_match(match, params_var)
    match.update player_ids_to_team_ids(params_var)
  end

  # Change hash to contain team ids rather than player ids.
  def player_ids_to_team_ids(params_var)
    new_params = player_id_to_team_id(params_var, 'first')
    player_id_to_team_id(new_params, 'second')
  end

  # Requests to create a singles match include first_player_id and
  # second_player_id.
  # However, match model expects first_team_id and second_team_id.
  # So, replace first_player_id with first_team_id, for example.
  # Player.#singles_team! may create a team to represent a singles player.
  def player_id_to_team_id(params_var, prefix)
    player_id_sym = "#{prefix}_player_id".to_sym
    player_id = params_var[player_id_sym]
    unless player_id.blank?
      params_var["#{prefix}_team_id".to_sym] =
        Player.find(player_id).singles_team!.id
      params_var.except! player_id_sym
    end
    params_var
  end
end
