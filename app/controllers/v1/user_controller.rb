# Controller for the current user
#
# Renders the current user.  The current user is determined
# by the authentication token in the request header
#
class V1::UserController < ApplicationController
  before_action :authorize_user!, only: [:show]

  def show
    render json: current_user
  end

end
