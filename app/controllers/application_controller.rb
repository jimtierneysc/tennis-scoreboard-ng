class ApplicationController < ActionController::API
  respond_to :json
  rescue_from ::Exceptions::LoginRequired, with: :render_login_required
  rescue_from ::ActiveRecord::RecordNotFound, with: :when_record_not_found
  include ::ActionController::Serialization

  def default_serializer_options
    {
      scope: nil,
      root: false
    }
  end

  include Authenticable

  protected
  # TODO: Use later
  #
  # def logged_in?
  #   true unless session[:user_id].nil? || User.find_by(id: session[:user_id]).nil? # nil is false
  # end
  #
  # def current_user
  #   @current_user ||= User.find(session[:user_id])
  # end

  def render_login_required
    render json: { errors: 'Login required' }, status: :forbidden
  end

  def check_login!
    unless user_signed_in?
      raise Exceptions::LoginRequired, 'Login required'
    end
  end

  # Handle record not found exception
  def when_record_not_found
    render json: { errors: 'Not found' }, status: :not_found
  end

end
