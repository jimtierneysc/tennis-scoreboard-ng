require 'rails_helper'

RSpec.describe TeamSerializer, type: :serializer do
  let(:resource) { FactoryGirl.create :doubles_team }
  let(:serializer) { TeamSerializer.new(resource) }

  subject do
    JSON.parse(serializer.to_json, symbolize_names: true)[:team]
  end

  it 'has an id' do
    expect(subject[:id]).to eql(resource.id)
  end

  it 'has name' do
    expect(subject[:name]).to eql(resource.name)
  end

  it 'has first player id' do
    expect(subject[:first_player][:id]).to eql(resource.first_player.id)
  end

  it 'has first player name' do
    expect(subject[:first_player][:name]).to eql(resource.first_player.name)
  end

  it 'has second player id' do
    expect(subject[:second_player][:id]).to eql(resource.second_player.id)
  end

  it 'has second player name' do
    expect(subject[:second_player][:name]).to eql(resource.second_player.name)
  end
end
