require 'rails_helper'
require 'controllers/controllers_shared'

RSpec.describe UsersController, type: :controller do
  let(:username1) {'one'}
  let(:username2) {'two'}
  let(:password) {'12345768'}
  let(:user1) { FactoryGirl.create :user, username: username1 }
  let(:user1_attributes) { FactoryGirl.attributes_for :user, username: username1 }
  let(:invalid_user1_attributes) do
    # missing username
    {password: password, password_confirmation: password}
  end

  describe 'GET #show' do
    before { get :show, id: user1.id }

    it 'renders json' do
      expect(json_response[:username]).to eql user1.username
    end

    it { is_expected.to respond_with 200 }
  end

  describe 'POST #create' do

    context 'when is successfully created' do
      before { post :create, { user: user1_attributes } }

      it 'renders json' do
        expect(json_response[:username]).to eql user1_attributes[:username]
      end

      it { is_expected.to respond_with 201 }
    end

    context 'when is not created' do
      before { post :create, { user: invalid_user1_attributes } }

      it_behaves_like 'attribute error', :username, :cant_be_blank

      it { is_expected.to respond_with 422 }
    end
  end

  describe 'PUT/PATCH #update' do
    before { api_authorization_header user1.auth_token }

    context 'when is successfully updated' do
      before do
        patch :update, { id: user1.id, user: { username: username2 } }
      end

      it 'renders json' do
        expect(json_response[:username]).to eql username2
      end

      it { is_expected.to respond_with 200 }
    end

    context 'when is not updated' do
      before do
        patch :update, { id: user1.id, user: { username: '' } }
      end

      it_behaves_like 'attribute error', :username, :cant_be_blank

      it { is_expected.to respond_with 422 }
    end
  end

  describe 'DELETE #destroy' do
    before do
      api_authorization_header user1.auth_token
      delete :destroy, { id: user1.id }
    end

    it { is_expected.to respond_with 204 }
  end
end
