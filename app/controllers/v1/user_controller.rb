class V1::UserController < ApplicationController
  before_action :authenticate_with_token!, only: [:show]

  def show
    render json: current_user
  end

end
