require 'rails_helper'
require 'controllers/controllers_shared'

class Authentication
  include Authenticable
  attr_reader :request, :response;
end

RSpec.describe Authenticable, { type: :controller, focus: true } do
  let(:authentication) { Authentication.new }
  let(:user) { FactoryGirl.create :user }
  subject { authentication }

  describe "#current_user" do
    before do
      request.headers["Authorization"] = user.auth_token
      allow(authentication).to receive(:request).and_return(request)
    end

    it "should return the user from the authorization header" do
      expect(authentication.current_user.auth_token).to eql user.auth_token
    end
  end

  describe "#authenticate_with_token" do
    before do
      allow(authentication).to receive(:current_user).and_return(nil)
      allow(response).to receive(:response_code).and_return(401)
      allow(response).to receive(:body).and_return({errors: 'Not authenticated'}.to_json)
      allow(authentication).to receive(:response).and_return(response)
    end

    it_behaves_like 'not authenticated'
  end

  describe "#user_signed_in?" do
    context "when there is a user on 'session'" do
      before do
        allow(authentication).to receive(:current_user).and_return(user)
      end

      it { is_expected.to be_user_signed_in }
    end

    context "when there is no user on 'session'" do
      before do
        allow(authentication).to receive(:current_user).and_return(nil)
      end

      it { is_expected.not_to be_user_signed_in }
    end
  end
end
