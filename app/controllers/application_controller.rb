# Application controller
#
# Base class for controllers
#
class ApplicationController < ActionController::API
  respond_to :json
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

  def rescue_record_not_found
    render json: { errors: 'Record not found' }, status: :not_found
  end

end
