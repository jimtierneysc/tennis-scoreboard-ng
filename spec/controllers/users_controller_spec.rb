require 'rails_helper'


RSpec.describe UsersController, type: :controller do
# RSpec.describe Api::V1::UsersController, type: :controller do
  describe "GET #show" do
    before(:each) do 
      @user = FactoryGirl.create :user
      get :show, id: @user.id
    end

    it "returns the information about a reporter on a hash" do
      user_response = json_response
      expect(user_response[:username]).to eql @user.username
    end

    it { is_expected.to respond_with 200 }
  end

  describe "POST #create" do

    context "when is successfully created" do
      before(:each) do
        @user_attributes = FactoryGirl.attributes_for :user
        post :create, { user: @user_attributes }
      end

      it "renders the json representation for the user record just created" do
        user_response = json_response
        expect(user_response[:username]).to eql @user_attributes[:username]
      end

      it { is_expected.to respond_with 201 }
    end

    context "when is not created" do
      before(:each) do
        @invalid_user_attributes = { password: "12345678", password_confirmation: "12345678" } #notice I'm not including the username
        post :create, { user: @invalid_user_attributes }
      end

      it "renders an errors json" do
        user_response = json_response
        expect(user_response).to have_key(:errors)
      end

      it "renders the json errors on why the user could not be created" do
        user_response = json_response
        expect(user_response[:errors][:username]).to include "can't be blank"
      end

      it { is_expected.to respond_with 422 }
    end
  end

  describe "PUT/PATCH #update" do
    before(:each) do
      @user = FactoryGirl.create :user
      api_authorization_header @user.auth_token 
    end

    context "when is successfully updated" do
      before(:each) do
        patch :update, { id: @user.id, user: { username: "newmail@example.com" } }
      end

      it "renders the json representation for the updated user" do
        user_response = json_response
        expect(user_response[:username]).to eql "newmail@example.com"
      end

      it { is_expected.to respond_with 200 }
    end

    # context "when is not updated" do
    #   before(:each) do
    #     patch :update, { id: @user.id, user: { username: "bademail.com" } }
    #   end
    #
    #   it "renders an errors json" do
    #     user_response = json_response
    #     expect(user_response).to have_key(:errors)
    #   end
    #
    #   it "renders the json errors on why the user could not be created" do
    #     user_response = json_response
    #     expect(user_response[:errors][:username]).to include "is invalid"
    #   end
    #
    #   it { is_expected.to respond_with 422 }
    # end
  end

  describe "DELETE #destroy" do
    before(:each) do
      @user = FactoryGirl.create :user
      api_authorization_header @user.auth_token 
      delete :destroy, { id: @user.id }
    end

    it { is_expected.to respond_with 204 }

  end
end
