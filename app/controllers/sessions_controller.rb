class SessionsController < ApplicationController

  def create
    session = params[:session]
    user_password = session[:password] if session
    user_username = session[:username] if session
    user = user_username.present? && User.find_by(username: user_username)

    if user && user.valid_password?(user_password)
      sign_in user, store: false
      user.generate_authentication_token!
      user.save!
      # render json: user, status: 200, location: [:api, user]
      render json: user, status: :ok
    else
      render json: { errors: "Invalid username or password" }, status: 422
    end 
  end

  def destroy
    user = User.find_by(auth_token: params[:id])    
    user.generate_authentication_token!
    user.save!
    head :no_content
  end
end
