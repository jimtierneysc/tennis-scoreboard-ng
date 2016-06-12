require 'test_helper'

class SomeControllerTest < ActionController::TestCase
  include Devise::TestHelpers

  def setup
    @request.env["devise.mapping"] = Devise.mappings[:admin]
    # sign_in players :one
  end


  test "should have a current user" do

  end

end