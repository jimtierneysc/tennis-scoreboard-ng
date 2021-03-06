# Base class for this application's controllers
#
class ApplicationController < ActionController::API
  respond_to :json
  rescue_from ::ActiveRecord::RecordNotFound, with: :rescue_record_not_found

  # Include JSON serialization
  include ::ActionController::Serialization

  # Include authentication support
  include Authenticable

  protected

  # Render an HTTP error on ActiveRecord::RecordNotFound
  def rescue_record_not_found
    render json: { errors: 'Record not found' }, status: :not_found
  end

end


