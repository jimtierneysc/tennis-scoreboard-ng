module Authenticable

  # Devise methods overwrites
  def current_user
    @current_user ||= User.find_by(auth_token: header_token)
  end

  def authorize_user!
    if header_token.blank?
      # Anonymous users can't request current user
      render json: { errors: 'Login required' }, status: :forbidden
    else
      # Token may be invalid
      render json: { errors: 'Not authorized' }, status: :unauthorized unless user_signed_in?
    end
  end

  def user_signed_in?
    current_user.present?
  end

  private

  def header_token
    request.headers['Authorization']
  end

end
