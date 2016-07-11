class UsersController < ApplicationController
  before_action :authenticate_with_token!, only: [:update, :destroy]
  before_action :set_user, only: [:show]

  def show
    render json: @user
  end

  def create
    user = User.new(user_params)

    if user.save
      render json: user, status: :created, location: @user
    else
      render json: { errors: user.errors }, status: :unprocessable_entity
    end
  end

  def update
    user = current_user
    if user.update(user_params)
      render json: user, status: :ok
    else
      render json: {errors: user.errors }, status: :unprocessable_entity
    end
  end

  def destroy
    current_user.destroy
    head :no_content
  end

  private

  def user_params
    params.require(:user).permit(:username, :password, :password_confirmation)
  end

  def set_user
    @user = User.find(params[:id])
  end
end
