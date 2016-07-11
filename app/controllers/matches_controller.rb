# Controller for matches.
# Renders a list of matches.
# Renders a single match.
# Creates new doubles matches and new singles matches.
# Updates a match.
# Deletes a match.
class MatchesController < ApplicationController
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
    @match = create_match(match_params)
    if @match.save
      render json: @match, status: :created, location: @match
    else
      render json: {errors: @match.errors}, status: :unprocessable_entity
    end
  end

  # PATCH/PUT /matches/1
  def update
    update_sym = if doubles_param? params
                   :update_doubles_match
                 else
                   :update_singles_match
                 end
    if send(update_sym, @match, match_params)
      render json: @match, status: :ok
    else
      render json: {errors: @match.errors}, status: :unprocessable_entity
    end
  end

  # DELETE /matches/1
  def destroy
    if @match.destroy
      head :no_content
    else
      render json: {errors: @match.errors}, status: :unprocessable_entity
    end
  end

  private

  def doubles_param?(params_var)
    params_var[:doubles].to_s == 'true'
  end

  # Opponents for a doubles match and for a singles match are different.
  # Singles match has players.  Doubles match has teams.
  def match_params
    params_var = params.require :match
    permit = [:title, :scoring, :doubles]
    permit += if doubles_param? params_var
                [:first_team_id, :second_team_id]
              else
                [:first_player_id, :second_player_id]
              end
    params_var.permit(permit)
  end

  def set_match
    @match = Match.find(params[:id])
  end

  # Handle record not found exception
  def when_record_not_found
    render json: { errors: 'Not found' }, status: :not_found
  end

  # # when there are only two teams, set as default for new doubles match
  # def assign_default_doubles_teams(match)
  #   teams = Team.where(doubles: true).limit 2
  #   match.first_team = teams[0]
  #   match.second_team = teams[1]
  # end
  # 
  # # when there are only two players, set as default for new singles match
  # def assign_default_singles_players(match)
  #   players = Player.all.limit(2)
  #   match.first_singles_player = players[0]
  #   match.second_singles_player = players[1]
  # end
  # 
  def create_doubles_match(params_var)
    Match.new params_var
  end

  def update_doubles_match(match, params_var)
    match.update params_var
  end

  def create_match(params_var)
    if doubles_param? params_var
      create_doubles_match(params_var)
    else
      create_singles_match(params_var)
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
