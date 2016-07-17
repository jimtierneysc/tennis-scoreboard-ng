require 'rails_helper'
require 'controllers/controllers_shared'

RSpec.describe SessionsController, { type: :controller } do

  let(:user) { FactoryGirl.create :user }
  let(:password) { '12345678' }
  let(:unknown_password) { '99999999' }

  describe "POST #create" do

    context 'when the credentials are correct' do

      before do
        credentials = { username: user.username, password: password }
        post :create, { session: credentials }
      end

      it 'should render the json representation' do
        user.reload
        expect(json_response[:auth_token]).to eql user.auth_token
      end

      it_behaves_like 'a response with success code', 200
    end

    context 'when the credentials are incorrect' do
      before do
        credentials = { username: user.username, password: unknown_password }
        post :create, { session: credentials }
      end

      it { expect(json_response).to include_error 'Invalid username or password' }

      it_behaves_like 'a response with error code', 422
    end

  end

  describe "DELETE #destroy" do
    before do
      sign_in user
    end

    describe 'valid token' do
      before do
        delete :destroy, id: user.auth_token
      end

      it_behaves_like 'a response with success code', 204
    end

    describe 'invalid token' do
      before do
        delete :destroy, id: 'xxxxxxx'
      end

      # NoOp
      it_behaves_like 'a response with success code', 204
    end
  end
end
