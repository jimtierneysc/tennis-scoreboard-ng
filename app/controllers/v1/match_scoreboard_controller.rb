# Controller for match scoreboards
#
# * Renders a match with sets and games using V1::MatchScoreboardSerializer
# * Executes commands to play the match
#
class V1::MatchScoreboardController < ApplicationController

  rescue_from ::Exceptions::UnknownOperation, with: :when_unknown_operation
  before_action :authorize_user!, only: [:update]
  before_action :set_match_eager_load, only: [:show, :update]

  # Render the match score
  # * *Params*
  #   * +:id+ - id of a Match
  # * *Response*
  #   * Serialized Match score
  def show
    render json: V1::MatchScoreboardSerializer.new(@match, root: false)
  end

  # Execute an action by calling Match.play_match!
  # * *Params*
  #   * +:action+ - action such as +:win_game+
  #   * +:version+ - match play version number
  #   * +:team+ - id of a Team to win a game
  #   * +:player+ - id of a Player to serve or win a game
  # * *Response*
  #   * Serialized Match score
  def update
    request_params = match_scoreboard_params
    action = request_params[:action].to_sym
    version = request_params[:version]
    team_id = request_params[:team]
    player_id = request_params[:player] unless team_id

    play_params = {}
    play_params[:version] = version if version
    play_params[:opponent] =
      if team_id
        Team.find(team_id) if team_id
      elsif player_id
        Player.find(player_id) if player_id
      end

    play_match {
      @match.play_match!(action, play_params)
    }
  end

  private

  def set_match_eager_load
    # @match = self.class.eager_load_match params[:id]
    @match = MatchLoader::eager_load_match params[:id]
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
      # TODO: Notify clients of a change
      reload_match
    rescue ::Exceptions::UnknownOperation
      # raise HTTP error
      raise
    rescue => e
      # render the scoreboard with an error element
      reload_match ({ other: e.message })
    end
    render json: V1::MatchScoreboardSerializer.new(@match, root: false)
  end

  def reload_match(errors=nil)
    @match = MatchLoader::eager_load_match params[:id]
    @match.errors.messages.merge! errors if errors
  end

end
