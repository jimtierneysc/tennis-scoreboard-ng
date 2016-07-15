require 'rails_helper'
require 'controllers/controllers_shared'

RSpec.describe MatchesController, type: :controller do

  let(:new_user) { FactoryGirl.create :user }
  let(:doubles_match_title) { 'doubles match' }
  let(:singles_match_title) { 'singles match' }
  let(:doubles_match2_title) { 'doubles match 2' }
  let(:doubles_match) { FactoryGirl.create :doubles_match, title: doubles_match_title }
  let(:doubles_match_attributes) { FactoryGirl.attributes_for :doubles_match, title: doubles_match_title }
  let(:doubles_match2) { FactoryGirl.create :doubles_match, title: doubles_match2_title }
  let(:singles_match) { FactoryGirl.create :singles_match, title: singles_match_title }
  let(:not_found_match_id) { doubles_match.id + singles_match.id }
  let(:new_doubles_match_title) { 'new doubles' }
  let(:new_singles_match_title) { 'new singles' }
  let(:singles_match_attributes) { FactoryGirl.attributes_for :singles_match, :player_ids, title: singles_match_title }

  def exclude_doubles_attribute(exclude)
    ControllersShared::exclude_attribute(doubles_match_attributes, exclude)
  end
  
  def change_doubles_attribute(name, value)
    ControllersShared::change_attribute(doubles_match_attributes, name, value)
  end

  describe 'GET #index' do
    before do
      get :index
    end

    it_behaves_like 'match list response'

    it { is_expected.to respond_with 200 }
  end

  describe 'GET #show' do
    context 'when doubles exists' do
      before do
        get :show, id: doubles_match.id
      end

      it_behaves_like 'doubles match response'

      it { is_expected.to respond_with 200 }
    end

    context 'when singles exists' do
      before do
        get :show, id: singles_match.id
      end

      it_behaves_like 'singles match response'

      it { is_expected.to respond_with 200 }
    end

    context 'when does not exists' do
      before do
        get :show, id: not_found_match_id
      end

      it_behaves_like 'not found'
    end
  end

  describe 'POST #create' do
    context 'when authorized' do
      before do
        api_authorization_header new_user.auth_token
      end

      context 'when doubles is successfully created' do
        before do
          post :create, { match: doubles_match_attributes }
        end

        it 'renders the title' do
          expect(json_response[:title]).to eql doubles_match_attributes[:title]
        end

        it_behaves_like 'doubles match response'

        it { is_expected.to respond_with 201 }
      end

      context 'when singles is successfully created' do
        before do
          post :create, { match: singles_match_attributes }
        end

        it 'renders the title' do
          expect(json_response[:title]).to eql singles_match_attributes[:title]
        end

        it_behaves_like 'singles match response'

        it { is_expected.to respond_with 201 }
      end

      context 'when title is nil' do
        before do
          post :create, { match: change_doubles_attribute(:title, nil) }
        end

        it 'generates a title' do
          expect(json_response[:title]).to start_with('Match')
        end
      end

      context 'when title is blank' do
        before do
          post :create, { match: change_doubles_attribute(:title, '') }
        end

        it 'generates a title' do
          expect(json_response[:title]).to start_with('Match')
        end
      end

      context 'when first team is missing' do
        before do
          post :create, { match: exclude_doubles_attribute(:first_team_id) }
        end

        it_behaves_like 'attribute error', :first_team, :cant_be_blank
      end

      context 'when second team is missing' do
        before do
          post :create, { match: exclude_doubles_attribute(:second_team_id) }
        end

        it_behaves_like 'attribute error', :second_team, :cant_be_blank
      end

      context 'when scoring is missing' do
        before do
          post :create, { match: exclude_doubles_attribute(:scoring) }
        end

        it_behaves_like 'attribute error', :scoring, :cant_be_blank
      end

      context 'when title is already taken' do
        before do
          doubles_match
          post :create, { match: doubles_match_attributes }
        end
        it_behaves_like 'attribute error', :title, :already_taken
      end
    end

    context 'when not authorized' do
      context 'when is not created' do
        before do
          post :create, { match: {} }
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

        context 'singles' do
          before do
            patch :update, { id: singles_match.id, match: { title: new_singles_match_title } }
          end

          it 'renders the json representation' do
            expect(json_response[:title]).to eql new_singles_match_title
          end

          it_behaves_like 'singles match response'

          it { is_expected.to respond_with 200 }
        end

        context 'doubles' do
          before do
            patch :update, { id: doubles_match.id, match: { title: new_doubles_match_title } }
          end

          it 'renders the json representation' do
            expect(json_response[:title]).to eql new_doubles_match_title
          end

          it_behaves_like 'doubles match response'

          it { is_expected.to respond_with 200 }
        end
      end

      context 'when does not exists' do
        before do
          patch :update, { id: not_found_match_id, match: { title: new_doubles_match_title } }
        end

        it_behaves_like 'not found'
      end

      context 'when title is already taken' do
        before do
          patch :update, { id: doubles_match.id, match: { title: doubles_match2.title } }
        end
        it_behaves_like 'attribute error', :title, :already_taken
      end
    end

    context 'when not authorized' do
      before do
        patch :update, { id: 1, match: { title: 'abc' } }
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
          delete :destroy, id: doubles_match.id
        end

        it { is_expected.to respond_with 204 }
      end

      context 'when does not exists' do
        before do
          delete :destroy, id: not_found_match_id
        end

        it_behaves_like 'not found'
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
