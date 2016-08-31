# Base class for this application's controllers
#
class ApplicationController < ActionController::API
  respond_to :json
  rescue_from ::ActiveRecord::RecordNotFound, with: :rescue_record_not_found
  include ::ActionController::Serialization

  # Options for active model serializer
  def default_serializer_options
    {
      scope: nil,
      root: false
    }
  end

  # Include authentication support
  include Authenticable


  protected

  # Render an HTTP error
  def rescue_record_not_found
    render json: { errors: 'Record not found' }, status: :not_found
  end

end


