require 'rails_helper'
require 'controllers/controllers_shared'

RSpec.describe UsersController, { type: :controller } do
  let(:username1) { 'one' }
  let(:username2) { 'two' }
  let(:password) { '12345768' }
  let(:user1) { FactoryGirl.create :user, username: username1 }
  let(:user1_attributes) { FactoryGirl.attributes_for :user, username: username1 }
  let(:invalid_user1_attributes) do
    # missing username
    { password: password, password_confirmation: password }
  end

  describe 'GET #show' do
    before { get :show, id: user1.id }

    it 'should render the json representation' do
      expect(json_response[:username]).to eql user1.username
    end

    it_behaves_like 'a response with success code', 200
  end

  describe 'POST #create' do
    context 'when is successfully created' do
      before { post :create, { user: user1_attributes } }

      it 'should render the json representation' do
        expect(json_response[:username]).to eql user1_attributes[:username]
      end

      it_behaves_like 'a response with success code', 201
    end

    context 'when is not created' do
      before { post :create, { user: invalid_user1_attributes } }

      it_behaves_like 'attribute error', :username, :cant_be_blank
      it_behaves_like 'a response with error code', 422
    end
  end

  describe 'PUT/PATCH #update' do
    context 'when authorized' do
      before { api_authorization_header user1.auth_token }

      context 'when is successfully updated' do
        before do
          patch :update, { id: user1.id, user: { username: username2 } }
        end

        it 'should render the json representation' do
          expect(json_response[:username]).to eql username2
        end

        it_behaves_like 'a response with success code', 200
      end

      context 'when is not updated' do
        before do
          patch :update, { id: user1.id, user: { username: '' } }
        end

        it_behaves_like 'attribute error', :username, :cant_be_blank
        it_behaves_like 'a response with error code', 422
      end
    end

    context 'when not authorized' do
      before { patch :update, { id: user1.id, user: {} } }

      it_behaves_like 'not authenticated'
    end
  end

  describe 'DELETE #destroy' do
    context 'when authorized' do
      before { api_authorization_header user1.auth_token }

      context 'when exists' do
        before { delete :destroy, id: user1.id }

        it_behaves_like 'a response with success code', 204
      end

      context 'when does not exists' do
        before { delete :destroy, id: 0 }

        it_behaves_like 'a response with success code', 204
      end
    end

    context 'when not authorized' do
      before { delete :destroy, id: 1 }

      it_behaves_like 'not authenticated'
    end
  end
end

