class UsersController < ApplicationController
  rescue_from ::ActiveRecord::RecordNotFound, with: :when_record_not_found
  before_action :authenticate_with_token!, only: [:update, :destroy]
  before_action :set_user, only: [:show]
  respond_to :json

  def show
    # respond_with User.find(params[:id])
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
    head 204
  end

  private

  def user_params
    params.require(:user).permit(:username, :password, :password_confirmation)
  end

  def set_user
    @user = User.find(params[:id])
  end

  # Handle record not found exception
  def when_record_not_found
    render json: { errors: 'Not found' }, status: :not_found
  end


end
