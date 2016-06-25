require 'rails_helper'
require 'controllers/controllers_shared'

RSpec.describe TeamsController, type: :controller do

  let(:new_user) { FactoryGirl.create :user }
  let(:doubles_team) { FactoryGirl.create :doubles_team }
  let(:doubles_team_attributes) { FactoryGirl.attributes_for :doubles_team }
  let(:not_found_team_id) {doubles_team.id + 1}
  let(:doubles_match) { FactoryGirl.create :doubles_match }
  let(:team_name) { doubles_team.name + 'a'}

  def exclude_attribute(exclude)
    attributes = doubles_team_attributes.clone
    attributes.delete(exclude)
    attributes
  end

  def change_attribute(name, value)
    attributes = doubles_team_attributes.clone
    attributes[name] = value
    attributes
  end


  describe "GET #show" do
    context "when exists" do
      before(:each) do
        get :show, id: doubles_team.id
      end

      it_behaves_like "team response"

      it "returns the information about a reporter on a hash" do
        controller_response = json_response
        expect(controller_response[:name]).to eql doubles_team.name
      end

      it { is_expected.to respond_with 200 }
    end

    context "when exists doubles team" do
      before(:each) do
        get :show, id: doubles_team.id
      end

      it_behaves_like "team response"

      it "returns the information about a reporter on a hash" do
        controller_response = json_response
        expect(controller_response[:name]).to eql doubles_team.name
      end

      it { is_expected.to respond_with 200 }
    end

    context "when does not exists" do
      before(:each) do
        get :show, id: not_found_team_id
      end

      it_behaves_like "not found"
    end
  end

  describe "POST #create" do
    context "when authorized" do
      before(:each) do
        api_authorization_header new_user.auth_token
      end

      context "when is successfully created" do
        before(:each) do
          post :create, { team: doubles_team_attributes }
        end

        it "renders the json representation" do
          controller_response = json_response
          expect(controller_response[:name]).to eql doubles_team_attributes[:name]
        end

        it { is_expected.to respond_with 201 }
      end

      context "when doubles team is successfully created" do
        before(:each) do
          post :create, { team: doubles_team_attributes }
        end

        it "renders the json representation" do
          controller_response = json_response
          expect(controller_response[:name]).to eql doubles_team_attributes[:name]
        end

        it { is_expected.to respond_with 201 }
      end

      context "when title is blank" do
        before(:each) do
          post :create, { team: change_attribute(:name, '') }
        end

        it "renders the json representation" do
          controller_response = json_response
          expect(controller_response).to include :name
        end

        it { is_expected.to respond_with 201 }
      end

      context "when title is nil" do
        before(:each) do
          post :create, { team: change_attribute(:name, nil) }
        end

        it { is_expected.to respond_with 201 }
      end

      context "when first player is missing" do
        before(:each) do
          post :create, { team: exclude_attribute(:first_player_id) }
        end

        it_behaves_like "attribute error", :first_player, "must not be blank"
      end

      context "when second player is missing" do
        before(:each) do
          post :create, { team: exclude_attribute(:second_player_id) }
        end

        it_behaves_like "attribute error", :second_player, "must be specified"
      end

      context "when name is already taken" do
        before(:each) do
          doubles_team
          post :create, { team: doubles_team_attributes }
        end
        it_behaves_like "attribute error", :name, "has already been taken"

      end
    end

    context "when not authorized" do
      context "when is not created" do
        before(:each) do
          post :create, { team: {} }
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
        let(:team_name) { doubles_team.name + 'a'}
        before(:each) do
          patch :update, { id: doubles_team.id, team: { name: team_name } }
        end

        it "renders the json representation" do
          controller_response = json_response
          expect(controller_response[:name]).to eql team_name
        end

        it { is_expected.to respond_with 200 }
      end


      context "when does not exists" do
        before(:each) do
          patch :update, { id: not_found_team_id, team: { name: team_name } }
        end

        it_behaves_like "not found"

      end
    end


    context "when not authorized" do
      before(:each) do
        patch :update, { id: 1, team: { } }
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
          delete :destroy, id: doubles_team.id
        end

        it { is_expected.to respond_with 204 }
      end

      context "when does not exists" do
        before(:each) do
          delete :destroy, id: not_found_team_id
        end

        it_behaves_like "not found"
      end


      context "when team in match" do
        before(:each) do
          delete :destroy, id: doubles_match.first_team_id
        end

        it_behaves_like "delete error", "Cannot delete a team in a match"
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
