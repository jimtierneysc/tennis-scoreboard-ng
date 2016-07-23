# Controller for  match scoreboard.
# Renders the current state of the match.
# Handles commands to change the state of the match.
class V1::MatchScoreBoardController < ApplicationController
  include MatchLoader

  rescue_from ::Exceptions::UnknownOperation, with: :when_unknown_operation
  before_action :check_login!, only: [:update]
  before_action :set_match_eager_load, only: [:show, :update]

  def show
    render json: MatchScoreBoardSerializer.new(@match, root: false)
  end

  # POST change to score /match_score_board/1
  def update
    params = match_score_board_params
    action = params[:action].to_sym
    param = nil
    if [:win_game, :win_match_tiebreaker, :win_tiebreaker].include?(action)
      team_id = params[:team]
      player_id = params[:player]
      param = if team_id
                Team.find(team_id)
              elsif player_id
                player = Player.find(player_id)
                player.singles_team unless player.nil?
              end
    elsif [:start_game].include?(action)
      player_id = params[:player]
      param = Player.find(player_id) unless player_id.nil?
    end
    play_match {
      @match.play_match!(action, param)
    }
  end

  private

  def set_match_eager_load
    @match = self.class.eager_load_match params[:id]
  end

  def when_unknown_operation(exception)
    render json: { errors: exception.message }, status: :unprocessable_entity
  end

  def match_score_board_params
    params.require(:match_score_board).permit(:action,
                                              :team,
                                              :player)
  end

  def play_match
    begin
      yield
      # TODO: Notify clients
      reload_match
    rescue ::Exceptions::UnknownOperation
      raise
    rescue ::ActiveRecord::RecordInvalid => e
      reload_match e.record.errors
    rescue  => e
      reload_match ({other: e.message})
    end
    render json: MatchScoreBoardSerializer.new(@match, root: false)
  end

  def reload_match errors=nil
    @match = self.class.eager_load_match params[:id]
    @match.errors.messages.merge! errors if errors
  end
end
