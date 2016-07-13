require 'rails_helper'

RSpec.describe PlayerSerializer, type: :serializer do
  context 'Resource Representation' do
    let(:resource) { FactoryGirl.create :player }
    let(:serializer) { PlayerSerializer.new(resource) }

    subject do
      JSON.parse(serializer.to_json, symbolize_names: true)[:player]
    end

    it 'has an id' do
      expect(subject[:id]).to eql(resource.id)
    end

    it 'has name' do
      expect(subject[:name]).to eql(resource.name)
    end
  end
end
