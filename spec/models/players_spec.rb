require 'rails_helper'

RSpec.describe Player, type: :model do
  before {
    @player = FactoryGirl.build(:player)
  }
  subject { @player }

  it { is_expected.to respond_to(:name) }
  it { is_expected.to be_valid }
  it { is_expected.to validate_presence_of(:name) }
  it { is_expected.to validate_uniqueness_of(:name).ignoring_case_sensitivity }

  # describe "#generate_authentication_token!" do
  #   it "generates a unique token" do
  #     # Devise.stub(:friendly_token).and_return("auniquetoken123")
  #     # allow(object).to receive_messages(:foo => 1, :bar => 2)
  #     allow(Devise).to receive(:friendly_token).and_return("auniquetoken123")
  #     @user.generate_authentication_token!
  #     expect(@user.auth_token).to eql "auniquetoken123"
  #   end
  #
  #   it "generates another token when one already has been taken" do
  #     existing_user = FactoryGirl.create(:user, auth_token: "auniquetoken123")
  #     @user.generate_authentication_token!
  #     expect(@user.auth_token).not_to eql existing_user.auth_token
  #   end
  # end
end
