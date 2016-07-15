require 'rails_helper'

RSpec.describe User, type: :model do
  subject { FactoryGirl.build(:user) }

  it 'has #username' do
    is_expected.to respond_to(:username)
  end

  it 'has #password' do
    is_expected.to respond_to(:password)
  end

  it 'has #password_confirmation' do
    is_expected.to respond_to(:password_confirmation)
  end

  it 'has #auth_token' do
    is_expected.to respond_to(:auth_token)
  end

  it 'is valid' do
    is_expected.to be_valid
  end

  it 'validates presence of #username' do
    is_expected.to validate_presence_of(:username)
  end

  it 'validate uniqueness of #username' do
    is_expected.to validate_uniqueness_of(:username).ignoring_case_sensitivity
  end

  it 'validate uniqueness of #auth_token' do
    is_expected.to validate_uniqueness_of(:auth_token).ignoring_case_sensitivity
  end

  describe '#generate_authentication_token!' do
    ATOKEN = 'auniquetoken'

    it 'generates a unique token' do
      allow(Devise).to receive(:friendly_token).and_return(ATOKEN)
      subject.generate_authentication_token!
      expect(subject.auth_token).to eql ATOKEN
    end

    it 'generates another token when duplicate' do
      existing_user = FactoryGirl.create(:user, auth_token: ATOKEN)
      subject.generate_authentication_token!
      expect(subject.auth_token).not_to eql existing_user.auth_token
    end
  end
end
