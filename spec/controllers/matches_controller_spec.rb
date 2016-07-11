require 'rails_helper'
require 'controllers/controllers_shared'

RSpec.describe MatchesController, type: :controller do

  let(:new_user) { FactoryGirl.create :user }
  let(:doubles_match) { FactoryGirl.create :doubles_match }
  let(:doubles_match_attributes) { FactoryGirl.attributes_for :doubles_match }
  let(:singles_match) { FactoryGirl.create :singles_match, :team_ids }
  let(:singles_match_attributes) { FactoryGirl.attributes_for :singles_match }
  let(:not_found_match_id) {doubles_match.id + singles_match.id}
  let(:match_title) { doubles_match.title + 'a' }
  let(:singles_match_attributes) { FactoryGirl.attributes_for :singles_match, :player_ids }

  def exclude_attribute(exclude)
    attributes = doubles_match_attributes.clone
    attributes.delete(exclude)
    attributes
  end

  CANT_BE_BLANK = 'can\'t be blank'

  describe "GET #show" do
    context "when doubles exists" do
      before(:each) do
        get :show, id: doubles_match.id
      end

      it_behaves_like "doubles match response"

      it { is_expected.to respond_with 200 }
    end

    context "when singles exists" do
      before(:each) do
        get :show, id: singles_match.id
      end

       it_behaves_like "singles match response"

      it { is_expected.to respond_with 200 }
    end

    context "when does not exists" do
      before(:each) do
        get :show, id: not_found_match_id
      end

      it_behaves_like "not found"
    end
  end

  describe "POST #create" do
    context "when authorized" do
      before(:each) do
        api_authorization_header new_user.auth_token
      end

      context "when doubles is successfully created" do
        before(:each) do
          post :create, { match: doubles_match_attributes }
        end

        it "renders the title" do
          controller_response = json_response
          expect(controller_response[:title]).to eql doubles_match_attributes[:title]
        end

        it_behaves_like "doubles match response"

        it { is_expected.to respond_with 201 }
      end

      context "when singles is successfully created" do
        before(:each) do
          post :create, { match: singles_match_attributes }
        end

        it "renders the title" do
          controller_response = json_response
          expect(controller_response[:title]).to eql singles_match_attributes[:title]
        end

        it_behaves_like "singles match response"

        it { is_expected.to respond_with 201 }
      end

      context "when first team is missing" do
        before(:each) do
          post :create, { match: exclude_attribute(:first_team_id) }
        end

        it_behaves_like "attribute error", :first_team, CANT_BE_BLANK
      end

      context "when second team is missing" do
        before(:each) do
          post :create, { match: exclude_attribute(:second_team_id) }
        end

        it_behaves_like "attribute error", :second_team, CANT_BE_BLANK
      end

      context "when scoring is missing" do
        before(:each) do
          post :create, { match: exclude_attribute(:scoring) }
        end

        it_behaves_like "attribute error", :scoring, CANT_BE_BLANK
      end

      context "when name is already taken" do
        before(:each) do
          doubles_match
          post :create, { match: doubles_match_attributes }
        end
        it_behaves_like "attribute error", :title, "has already been taken"
      end
    end

    context "when not authorized" do
      context "when is not created" do
        before(:each) do
          post :create, { match: {} }
        end

        it_behaves_like "login required"
      end
    end
  end

  describe "PUT/PATCH #update" do
    context "when authorized" do
      before(:each) do
        api_authorization_header new_user.auth_token
      end

      context "when is successfully updated" do
        before(:each) do
          patch :update, { id: doubles_match.id, match: { title: match_title } }
        end

        it "renders the json representation" do
          controller_response = json_response
          expect(controller_response[:title]).to eql match_title
        end

        it_behaves_like "doubles match response"

        it { is_expected.to respond_with 200 }
      end


      context "when does not exists" do
        before(:each) do
          patch :update, { id: not_found_match_id, match: { title: match_title } }
        end

        it_behaves_like "not found"

      end
    end

    context "when not authorized" do
      before(:each) do
        patch :update, { id: 1, match: { title: 'abc' } }
      end

      it_behaves_like "login required"
    end

  end

  describe "DELETE #destroy" do
    context "when authorized" do

      before(:each) do
        api_authorization_header new_user.auth_token
      end

      context "when exists" do
        before(:each) do
          delete :destroy, id: doubles_match.id
        end

        it { is_expected.to respond_with 204 }
      end

      context "when does not exists" do
        before(:each) do
          delete :destroy, id: not_found_match_id
        end

        it_behaves_like "not found"
      end
    end

    context "when not authorized" do
      before(:each) do
        delete :destroy, id: 1
      end

      it_behaves_like "login required"
    end
  end
end
