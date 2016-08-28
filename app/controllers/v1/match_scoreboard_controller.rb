# Controller for a match scoreboard
#
# Renders the current state of the match
#
# Handles commands to play the match
#
class V1::MatchScoreboardController < ApplicationController
  include MatchLoader

  rescue_from ::Exceptions::UnknownOperation, with: :when_unknown_operation
  before_action :authorize_user!, only: [:update]
  before_action :set_match_eager_load, only: [:show, :update]

  def show
    render json: V1::MatchScoreboardSerializer.new(@match, root: false)
  end

  # POST change to score /match_scoreboard/1
  def update
    request_params = match_scoreboard_params
    action = request_params[:action].to_sym
    version = request_params[:version]
    team_id = request_params[:team]
    player_id = request_params[:player] unless team_id

    play_params = {}
    play_params[:version] = version if version
    play_params[:team] = Team.find(team_id) if team_id
    play_params[:player] = Player.find(player_id) if player_id

    play_match {
      @match.play_match!(action, play_params)
    }
  end

  private

  def set_match_eager_load
    @match = self.class.eager_load_match params[:id]
  end

  def when_unknown_operation(exception)
    render json: { errors: exception.message }, status: :unprocessable_entity
  end

  def match_scoreboard_params
    params.require(:match_scoreboard).permit(:action,
                                              :team,
                                              :player,
                                              :version)
  end

  def play_match
    begin
      yield
      # TODO: Notify clients
      reload_match
    rescue ::Exceptions::UnknownOperation
      # raise HTTP error
      raise
        # redundant
        # rescue ::ActiveRecord::RecordInvalid => e
        #   reload_match e.record.errors
    rescue => e
      # render the scoreboard with an error
      reload_match ({ other: e.message })
    end
    render json: V1::MatchScoreboardSerializer.new(@match, root: false)
  end

  def reload_match(errors=nil)
    @match = self.class.eager_load_match params[:id]
    @match.errors.messages.merge! errors if errors
  end
end
