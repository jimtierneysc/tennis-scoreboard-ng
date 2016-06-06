class ApplicationController < ActionController::API
  include DeviseTokenAuth::Concerns::SetUserByToken

  helper_method :logged_in?, :current_user
  rescue_from ::Exceptions::LoginRequired, with: :forbidden
  include ::ActionController::Serialization

  def default_serializer_options
    {
      scope: nil,
      root: false
    }
  end

  protected

  def logged_in?
    true unless session[:user_id].nil? || User.find_by(id: session[:user_id]).nil? # nil is false
  end

  def current_user
    @current_user ||= User.find(session[:user_id])
  end

  def forbidden
    # 403 error
    head :forbidden
  end

  def check_login
    unless logged_in?
      raise Exceptions::LoginRequired, 'Login required'
    end
  end

end
