# Controller for the current user
#
# Renders the current user using V1::UserSerializer.
# The current user is determined
# by the authentication token in the request header
#
class V1::UserController < ApplicationController
  before_action :authorize_user!, only: [:show]

  # Get the current user
  # * *Response*
  #   * serialized User
  def show
    render json: current_user
  end

end
