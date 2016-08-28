# Controller for a user session
#
# Validates credentials and returns authentication token
#
# Regenerates the authentication token
#
class V1::SessionsController < ApplicationController

  def create
    session = params[:session]
    user_password = session[:password] if session
    user_username = session[:username] if session
    user = user_username.present? && User.find_by(username: user_username)

    if user && user.valid_password?(user_password)
      # The following two lines prevent a user from being logged in
      # on multiple devices.

      # user.generate_authentication_token!
      # user.save!

      render json: V1::SessionSerializer.new(user, root: false)
    else
      render json: { errors: 'Invalid username or password' }, status: 422
    end
  end

  def destroy
    user = User.find_by(auth_token: params[:id])
    if user
      user.generate_authentication_token!
      user.save!
    end
    head :no_content
  end
end
