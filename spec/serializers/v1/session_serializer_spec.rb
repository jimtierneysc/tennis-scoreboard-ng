require 'rails_helper'

RSpec.describe V1::SessionSerializer, { type: :serializer } do
  let(:resource) { FactoryGirl.create :user }
  let(:serializer) { V1::SessionSerializer.new(resource) }

  subject do
    JSON.parse(serializer.to_json, symbolize_names: true)
  end

  it 'should have id' do
    expect(subject[:id]).to eql(resource.id)
  end

  it 'should have username' do
    expect(subject[:username]).to eql(resource.username)
  end

  it 'should have token' do
    is_expected.to include :auth_token
  end
end
