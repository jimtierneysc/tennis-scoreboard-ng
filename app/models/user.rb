# Model for a user
#
# == Overview
#
# A user has a name, password and authentication token
#
# == Schema Information
#
# Table name: users
#
#  id                     :integer          not null, primary key
#  username               :string           default(""), not null
#  encrypted_password     :string           default(""), not null
#  reset_password_token   :string
#  reset_password_sent_at :datetime
#  remember_created_at    :datetime
#  sign_in_count          :integer          default(0), not null
#  current_sign_in_at     :datetime
#  last_sign_in_at        :datetime
#  current_sign_in_ip     :string
#  last_sign_in_ip        :string
#  created_at             :datetime
#  updated_at             :datetime
#  auth_token             :string           default("")
#
class User < ActiveRecord::Base
  validates :auth_token, uniqueness: true
  validates :username, uniqueness: true
  validates :username, presence: true

  devise :database_authenticatable

  before_create :generate_authentication_token!

  # Set auth_token attribute to a new value
  def generate_authentication_token!
    begin
      self.auth_token = Devise.friendly_token
    end while self.class.exists?(auth_token: auth_token)
  end

end
