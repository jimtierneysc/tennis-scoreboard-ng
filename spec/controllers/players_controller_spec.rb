require 'rails_helper'
require 'controllers/controllers_shared'

RSpec.describe PlayersController, type: :controller do


  let(:new_user) { FactoryGirl.create :user }
  let(:player) { FactoryGirl.create :player }
  let(:player_attributes) { FactoryGirl.attributes_for :player }
  let(:player_name) { player.name + 'a' }
  let(:not_found_player_id) { player.id + 1 }
  let(:doubles_team) { FactoryGirl.create :doubles_team }
  let(:doubles_match) { FactoryGirl.create :doubles_match }

  describe "GET #show" do
    context "when exists" do
      before(:each) do
        get :show, id: player.id
      end

      it "returns the information about a reporter on a hash" do
        controller_response = json_response
        expect(controller_response[:name]).to eql player.name
      end

      it { is_expected.to respond_with 200 }
    end

    context "when does not exists" do
      before(:each) do
        get :show, id: not_found_player_id
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
          post :create, { player: player_attributes }
        end

        it_behaves_like "player response"

        it "renders the player name" do
          controller_response = json_response
          expect(controller_response[:name]).to eql player_attributes[:name]
        end

        it { is_expected.to respond_with 201 }
      end

      context "when name is missing" do
        before(:each) do
          invalid_model_attributes = {}
          post :create, { player: invalid_model_attributes }
        end

        it_behaves_like "attribute error", :name, "can't be blank"
      end

      context "when name is already taken" do
        before(:each) do
          player
          post :create, { player: player_attributes }
        end

        it_behaves_like "attribute error", :name, "has already been taken"
      end
    end

    context "when not authorized" do
      context "when is not created" do
        before(:each) do
          post :create, { player: {} }
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
          patch :update, { id: player.id, player: { name: player_name } }
        end

        it_behaves_like "player response"

        it "renders the player name" do
          controller_response = json_response
          expect(controller_response[:name]).to eql player_name
        end

        it { is_expected.to respond_with 200 }
      end


      context "when does not exists" do
        before(:each) do
          patch :update, { id: not_found_player_id, player: { name: player_name } }
        end

        it_behaves_like "not found"

      end
    end


    context "when not authorized" do
      before(:each) do
        patch :update, { id: 1, player: { } }
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
          delete :destroy, id: player.id
        end

        it { is_expected.to respond_with 204 }
      end

      context "when does not exists" do
        before(:each) do
          delete :destroy, id: not_found_player_id
        end

        it_behaves_like "not found"
      end

      context "when player on team" do
        before(:each) do
          delete :destroy, id: doubles_team.first_player_id
        end

        it_behaves_like "delete error", "Cannot delete a player in a match or on a team"
      end

      context "when player in match" do
        before(:each) do
          delete :destroy, id: doubles_match.first_team.first_player_id
        end

        it_behaves_like "delete error", "Cannot delete a player in a match or on a team"
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
