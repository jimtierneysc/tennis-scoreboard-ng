class ApplicationController < ActionController::API
  respond_to :json
  rescue_from ::Exceptions::LoginRequired, with: :rescue_login_required
  rescue_from ::ActiveRecord::RecordNotFound, with: :rescue_record_not_found
  include ::ActionController::Serialization

  def default_serializer_options
    {
      scope: nil,
      root: false
    }
  end

  include Authenticable

  protected

  def rescue_login_required
    render json: { errors: 'Login required' }, status: :forbidden
  end

  def rescue_record_not_found
    render json: { errors: 'Not found' }, status: :not_found
  end

end
