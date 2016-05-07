require 'test_helper'

# Test for the user model.
class UserTest < ActiveSupport::TestCase
  def setup
    @user = User.create! username: "auser", password: "apassword"
  end

  test 'should authenticate user' do
    @user.authenticate("apassword")
  end
end
