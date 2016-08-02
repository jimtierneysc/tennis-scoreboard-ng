# Model for a user.
#
# A user has a name, password and authentication token.
#
class User < ActiveRecord::Base
  validates :auth_token, uniqueness: true
  validates :username, uniqueness: true
  validates :username, presence: true

  devise :database_authenticatable

  before_create :generate_authentication_token!

  def generate_authentication_token!
    begin
      self.auth_token = Devise.friendly_token
    end while self.class.exists?(auth_token: auth_token)
  end

end
