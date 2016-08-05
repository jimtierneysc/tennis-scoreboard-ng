class V1::UserController < ApplicationController
  before_action :authorize_user!, only: [:show]

  def show
    render json: current_user
  end

end
