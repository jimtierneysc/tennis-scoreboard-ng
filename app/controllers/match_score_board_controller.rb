# Controller for  match scoreboard.
# Renders the current state of the match.
# Handles commands to change the state of the match.
class MatchScoreBoardController < ApplicationController
  include MatchLoader

  rescue_from ::ActiveRecord::RecordNotFound, with: :when_record_not_found
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
      team = params[:team]
      player = params[:player]
      param = if team
                Team.find(team)
              elsif player
                # Model expects team rather than player
                @match.team_of_player Player.find(player)
              end
    elsif [:start_next_game].include?(action)
      player = params[:player]
      param = Player.find(player) unless player.nil?
    end
    change_score {
      @match.change_score!(action, param)
    }
  end

  private

  def set_match_eager_load
    @match = self.class.eager_load_match params[:id]
  end

  def when_record_not_found
    render json: { errors: 'Not found' }, status: :not_found
  end

  def when_unknown_operation(exception)
    render json: { errors: exception.message }, status: :unprocessable_entity
  end

  def match_score_board_params
    params.require(:match_score_board).permit(:action,
                                              :team,
                                              :player)
  end

  def change_score
    # Prevent scoring unless logged in.  Exception handled by application_controller.
    # TODO authentication
    # check_login
    begin
      yield
      # TODO: Notify clients
      # update_version_and_notify
      # TODO try to get rid of this query for better performance.  It is needed
      # after delete a game or set.
      @match = self.class.eager_load_match params[:id]
    rescue ::Exceptions::UnknownOperation
      raise
    rescue  => e
      @match = self.class.eager_load_match params[:id]
      @match.errors.add(:other, e.message)
    end
    render json: MatchScoreBoardSerializer.new(@match, root: false)
  end

end
