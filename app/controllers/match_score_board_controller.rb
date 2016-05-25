# Controller for read only view of match scoreboard
# Shows the current state of the match.
# A view parameter may be passed as a query parameter.
# The view parameter indicates how much detail to show.
# The user may view only the set scores up to all of the games in all sets.
# The view is persisted in a cookie.
class MatchScoreBoardController < ApplicationController
  include MatchLoader

  rescue_from ::ActiveRecord::RecordNotFound, with: :when_record_not_found
  before_action :set_match_eager_load, only: [:show]

  def show
    # # Set variables used by application.html.erb
    # # and AutoUpdater.coffee
    # @version = 1; #Version.find_version(Version::MESSAGES)
    # @body_properties = {
    #   id: 'scoreboard_body',
    #   'data-version': @version,
    #   'data-url': "#{request.path}.js"
    # }
    # view = request.query_parameters[:view]
    # view_context.score_board_view = view if view

    render json: MatchScoreBoardSerializer.new(@match, root: false)

  end

  private

  def set_match_eager_load
    @match = self.class.eager_load_match params[:id]
  end

  def when_record_not_found
    render json: { error: 'Not found' }, status: :not_found
  end
end
