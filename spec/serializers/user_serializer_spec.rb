require 'rails_helper'

RSpec.describe UserSerializer, type: :serializer do
  let(:resource) { FactoryGirl.create :user }
  let(:serializer) { UserSerializer.new(resource) }

  subject do
    JSON.parse(serializer.to_json, symbolize_names: true)[:user]
  end

  it 'has an id' do
    expect(subject[:id]).to eql(resource.id)
  end

  it 'has username' do
    expect(subject[:username]).to eql(resource.username)
  end

  it 'has token' do
    is_expected.to include :auth_token
  end
end
