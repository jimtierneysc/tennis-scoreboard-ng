require 'rails_helper'
require 'controllers/controllers_shared'

RSpec.describe TeamsController, { type: :controller } do

  let(:new_user) { FactoryGirl.create :user }
  let(:doubles_team_name) {'doubles team'}
  let(:doubles_team2_name) {'doubles team 2'}
  let(:player_name) {'player name'}
  let(:player2_name) {'player2 name'}
  let(:doubles_team) { FactoryGirl.create :doubles_team, name: doubles_team_name,
                                          first_player_name: player_name }
  let(:doubles_team2) { FactoryGirl.create :doubles_team, name: doubles_team2_name,
                                           first_player_name: player2_name }
  let(:doubles_team_attributes) { FactoryGirl.attributes_for :doubles_team }
  let(:not_found_team_id) {doubles_team.id + 1}
  let(:not_found_player_id) {doubles_team.id}
  let(:doubles_match) { FactoryGirl.create :doubles_match }
  let(:team_name) { doubles_team.name + 'a'}

  def exclude_team_attribute(exclude)
    ControllersShared::exclude_attribute(doubles_team_attributes, exclude)
  end

  def change_team_attribute(name, value)
    ControllersShared::change_attribute(doubles_team_attributes, name, value)
  end

  describe 'GET #index' do
      before { get :index }

      it_behaves_like 'team list response'
      it_behaves_like 'a response with success code', 200
  end

  describe 'GET #show' do
    context 'when exists' do
      before { get :show, id: doubles_team.id }

      it_behaves_like 'team response'

      it 'should render the json representation' do
        expect(json_response[:name]).to eql doubles_team.name
      end

      it_behaves_like 'a response with success code', 200
    end

    context 'when exists doubles team' do
      before { get :show, id: doubles_team.id }

      it_behaves_like 'team response'

      it 'should render the json representation' do
        expect(json_response[:name]).to eql doubles_team.name
      end

      it_behaves_like 'a response with success code', 200
    end

    context 'when does not exists' do
      before { get :show, id: not_found_team_id }

      it_behaves_like 'not found'
    end
  end

  describe 'POST #create' do
    context 'when authorized' do
      before { api_authorization_header new_user.auth_token }

      context 'when is successfully created' do
        before do
          post :create, { team: doubles_team_attributes }
        end

        it 'should render the json representation' do
          expect(json_response[:name]).to eql doubles_team_attributes[:name]
        end

        it_behaves_like 'a response with success code', 201
      end

      context 'when doubles team is successfully created' do
        before { post :create, { team: doubles_team_attributes } }

        it 'should render the json representation' do
          expect(json_response[:name]).to eql doubles_team_attributes[:name]
        end

        it_behaves_like 'a response with success code', 201
      end

      context 'when name is blank' do
        before do
          post :create, { team: change_team_attribute(:name, '') }
        end

        it 'should generate a name' do
          expect(json_response[:name]).to start_with('Team')
        end

      end

      context 'when name is nil' do
        before do
          post :create, { team: change_team_attribute(:name, nil) }
        end

        it 'should generate a name' do
          expect(json_response[:name]).to start_with('Team')
        end
      end

      context 'when first player is missing' do
        before do
          post :create, { team: exclude_team_attribute(:first_player_id) }
        end

        it_behaves_like 'attribute error', :first_player, :cant_be_blank
      end

      context 'when second player is missing' do
        before do
          post :create, { team: exclude_team_attribute(:second_player_id) }
        end

        it_behaves_like 'attribute error', :second_player, 'must be specified'
      end

      context 'when name is already taken' do
        before do
          doubles_team
          post :create, { team: doubles_team_attributes }
        end

        it_behaves_like 'attribute error', :name, :already_taken
      end

      context 'when first player not found' do
        before do
          post :create, { team: change_team_attribute(:first_player_id, not_found_player_id) }
        end

        it_behaves_like 'attribute error', :first_player, :not_found
      end

      context 'when second player is not found' do
        before do
          post :create, { team: change_team_attribute(:second_player_id, not_found_player_id) }
        end

        it_behaves_like 'attribute error', :second_player, :not_found
      end
    end

    context 'when not authorized' do
      context 'when is not created' do
        before { post :create, { team: {} } }

        it_behaves_like 'login required'
      end
    end
  end

  describe 'PUT/PATCH #update' do
    context 'when authorized' do
      before { api_authorization_header new_user.auth_token }

      context 'when is successfully updated' do
        let(:team_name) { doubles_team.name + 'a'}
        before do
          patch :update, { id: doubles_team.id, team: { name: team_name } }
        end

        it 'should render the json representation' do
          expect(json_response[:name]).to eql team_name
        end

        it_behaves_like 'a response with success code', 200
      end

      context 'when does not exists' do
        before do
          patch :update, { id: not_found_team_id, team: { name: team_name } }
        end

        it_behaves_like 'not found'
      end

      context 'when name is already taken' do
        before do
          patch :update, { id: doubles_team.id, team: { name: doubles_team2.name } }
        end

        it_behaves_like 'attribute error', :name, :already_taken
      end
    end

    context 'when not authorized' do
      before { patch :update, { id: 1, team: {} } }

      it_behaves_like 'login required'
    end

  end

  describe 'DELETE #destroy' do
    context 'when authorized' do
      before { api_authorization_header new_user.auth_token }

      context 'when exists' do
        before { delete :destroy, id: doubles_team.id }

        it_behaves_like 'a response with success code', 204
      end

      context 'when does not exists' do
        before { delete :destroy, id: not_found_team_id }

        it_behaves_like 'not found'
      end

      context 'when team in match' do
        before { delete :destroy, id: doubles_match.first_team_id }

        it_behaves_like 'an error when delete referenced entity', 'Cannot delete a team in a match'
      end
    end

    context 'when not authorized' do
      before { delete :destroy, id: 1 }

      it_behaves_like 'login required'
    end
  end
end
