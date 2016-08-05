require 'rails_helper'
require 'controllers/controllers_shared'

RSpec.describe V1::ApplicationController, { type: :controller } do
  let(:user1) { FactoryGirl.create :user }

  controller do
    def index
      authorize_user!
    end
  end

  def set_authorization token
    request.headers['Authorization'] = token
  end

  describe 'authorize user' do
    context 'when no auth token' do
      before { get :index }

      it 'should not have user' do
        expect(subject.current_user).to be_nil
      end

      it_behaves_like 'login required'
    end

    context 'when invalid auth token' do
      before do
        set_authorization 'abcd'
        get :index
      end

      it 'should not have user' do
        expect(subject.current_user).to be_nil
      end

      it_behaves_like 'not authorized'
    end

    context 'when valid auth token' do
      before do
        set_authorization user1.auth_token
        get :index
      end

      it 'should have user' do
        expect(subject.current_user).not_to be_nil
      end

      it { is_expected.to be_user_signed_in }

      it_behaves_like 'a response with success code', 200
    end
  end

end

