require 'rails_helper'

RSpec.describe V1::PlayerSerializer, { type: :serializer } do
  let(:resource) { FactoryGirl.create :player }
  let(:serializer) { V1::PlayerSerializer.new(resource) }

  subject do
    JSON.parse(serializer.to_json, symbolize_names: true)
  end

  it 'should have id' do
    expect(subject[:id]).to eql(resource.id)
  end

  it 'should have name' do
    expect(subject[:name]).to eql(resource.name)
  end
end
