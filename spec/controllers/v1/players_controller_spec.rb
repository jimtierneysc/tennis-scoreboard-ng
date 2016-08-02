require 'rails_helper'
require 'controllers/controllers_shared'

RSpec.describe V1::PlayersController, { type: :controller } do

  let(:new_user) { FactoryGirl.create :user }
  let(:player_name) { 'player1'}
  let(:player2_name) { 'player2'}
  let(:player) { FactoryGirl.create :player, name: player_name }
  let(:player2) { FactoryGirl.create :player, name: player2_name }
  let(:player_attributes) { FactoryGirl.attributes_for :player, name: player_name }
  let(:new_player_name) { 'new player' }
  let(:not_found_player_id) { player.id + 1 }
  let(:doubles_team) { FactoryGirl.create :doubles_team }
  let(:doubles_match) { FactoryGirl.create :doubles_match }

  describe 'GET #index' do
    context 'when exists' do
      before do
        player
        get :index
      end

      it_behaves_like 'player list response'
      it_behaves_like 'a response with success code', 200
    end
  end

  describe 'GET #show' do
    context 'when exists' do
      before do
        get :show, id: player.id
      end

      it_behaves_like 'player response'

      it 'should render json representation' do
        expect(json_response[:name]).to eql player.name
      end

      it_behaves_like 'a response with success code', 200
    end

    context 'when does not exists' do
      before do
        get :show, id: not_found_player_id
      end

      it_behaves_like 'not found'
    end
  end

  describe 'POST #create' do
    context 'when authorized' do
      before do
        api_authorization_header new_user.auth_token
      end

      context 'when is successfully created' do
        before do
          post :create, { player: player_attributes }
        end

        it_behaves_like 'player response'

        it 'should render json representation' do
          expect(json_response[:name]).to eql player_attributes[:name]
        end

        it_behaves_like 'a response with success code', 201
      end

      context 'when name is missing' do
        before do
          invalid_model_attributes = {}
          post :create, { player: invalid_model_attributes }
        end

        it_behaves_like 'attribute error', :name, :cant_be_blank
      end

      context 'when name is already taken' do
        before do
          player
          post :create, { player: player_attributes }
        end

        it_behaves_like 'attribute error', :name, :already_taken
      end
    end

    context 'when not authorized' do
      context 'when is not created' do
        before do
          post :create, { player: {} }
        end

        it_behaves_like 'login required'
      end
    end
  end

  describe 'PUT/PATCH #update' do
    context 'when authorized' do
      before do
        api_authorization_header new_user.auth_token
      end

      context 'when is successfully updated' do
        before do
          patch :update, { id: player.id, player: { name: new_player_name } }
        end

        it_behaves_like 'player response'

        it 'should render json representation' do
          expect(json_response[:name]).to eql new_player_name
        end

        it_behaves_like 'a response with success code', 200
      end

      context 'when does not exists' do
        before do
          patch :update, { id: not_found_player_id, player: { name: new_player_name } }
        end

        it_behaves_like 'not found'
      end

      context 'when name is missing' do
        before do
          patch :update, { id: player.id, player: { name: '' } }
        end

        it_behaves_like 'attribute error', :name, :cant_be_blank
      end

      context 'when name is already taken' do
        before do
          patch :update, { id: player.id, player: { name: player2.name } }
        end

        it_behaves_like 'attribute error', :name, :already_taken
      end
    end

    context 'when not authorized' do
      before do
        patch :update, { id: 1, player: { } }
      end

      it_behaves_like 'login required'
    end

  end

  describe 'DELETE #destroy' do
    context 'when authorized' do

      before do
        api_authorization_header new_user.auth_token
      end

      context 'when exists' do
        before do
          delete :destroy, id: player.id
        end

        it_behaves_like 'a response with success code', 204
      end

      context 'when does not exists' do
        before do
          delete :destroy, id: not_found_player_id
        end

        it_behaves_like 'not found'
      end

      context 'when player on team' do
        before do
          delete :destroy, id: doubles_team.first_player_id
        end

        it_behaves_like 'an error when delete referenced entity', 'Can\'t delete a player in a match or on a team'
      end

      context 'when player in match' do
        before do
          delete :destroy, id: doubles_match.first_team.first_player_id
        end

        it_behaves_like 'an error when delete referenced entity', 'Can\'t delete a player in a match or on a team'
      end
    end

    context 'when not authorized' do
      before do
        delete :destroy, id: 1
      end

      it_behaves_like 'login required'
    end
  end
end
