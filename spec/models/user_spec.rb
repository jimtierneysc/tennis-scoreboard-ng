require 'rails_helper'

RSpec.describe User, { type: :model } do
  subject { FactoryGirl.build(:user) }

  it { is_expected.to respond_to(:username) }

  it { is_expected.to respond_to(:password) }

  it { is_expected.to respond_to(:password_confirmation) }

  it { is_expected.to respond_to(:auth_token) }

  it { is_expected.to validate_presence_of(:username) }

  it { is_expected.to validate_uniqueness_of(:username).ignoring_case_sensitivity }

  it { is_expected.to validate_uniqueness_of(:auth_token).ignoring_case_sensitivity }

  describe '#generate_authentication_token!' do
    ATOKEN = 'auniquetoken'

    it 'should generate a unique token' do
      allow(Devise).to receive(:friendly_token).and_return(ATOKEN)
      subject.generate_authentication_token!
      expect(subject.auth_token).to eql ATOKEN
    end

    it 'should generate another token when duplicate' do
      existing_user = FactoryGirl.create(:user, auth_token: ATOKEN)
      subject.generate_authentication_token!
      expect(subject.auth_token).not_to eql existing_user.auth_token
    end
  end
end
