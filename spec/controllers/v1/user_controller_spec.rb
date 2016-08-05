require 'rails_helper'
require 'controllers/controllers_shared'

RSpec.describe V1::UserController, { type: :controller } do
  let(:username1) { 'one' }
  let(:username2) { 'two' }
  let(:password) { '12345768' }
  let(:user1) { FactoryGirl.create :user, username: username1 }
  let(:user1_attributes) { FactoryGirl.attributes_for :user, username: username1 }

  describe 'GET #show' do
    context 'when is authorized' do
      before { api_authorization_header user1.auth_token }
      before { get :show }

      it 'should render the json representation' do
        expect(json_response[:username]).to eql user1.username
      end

      it_behaves_like 'a response with success code', 200
    end

    context 'when is not logged in' do
      before { get :show }

      it_behaves_like 'login required'
    end
  end

end

