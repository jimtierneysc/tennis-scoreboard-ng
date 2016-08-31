# Controller for the current user
#
# * Renders the current user.
# The current user is determined
# by the authentication token in the request header
#
class V1::UserController < ApplicationController
  before_action :authorize_user!, only: [:show]

  # Get the user associated with the
  # authentication token in the HTTP request header
  # * *Response*
  #   * User
  def show
    render json: current_user
  end

end
