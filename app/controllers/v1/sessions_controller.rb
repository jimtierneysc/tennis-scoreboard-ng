# Controller for a user session
#
# * Validates credentials and returns user attributes
# * Regenerates the authentication token of a user
#
class V1::SessionsController < ApplicationController

  # Login a user
  # Validate user credentials.  If valid, respond with
  # an authentication token for the user.
  # * *Request*
  #   * +:username+
  #   * +:password+
  # * *Response*
  #   * User or HTTP error.  See V1::SessionSerializer
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

  # Clear the authentication token associated with a user
  # * *Params*
  #   * +:id+ - authentication token
  # * *Response*
  #   * +:no_content+ or HTTP error
  def destroy
    user = User.find_by(auth_token: params[:id])
    if user
      user.generate_authentication_token!
      user.save!
    end
    head :no_content
  end
end
