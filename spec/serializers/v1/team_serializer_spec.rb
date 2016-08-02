require 'rails_helper'

RSpec.describe V1::TeamSerializer, { type: :serializer } do
  let(:resource) { FactoryGirl.create :doubles_team }
  let(:serializer) { V1::TeamSerializer.new(resource) }

  subject do
    JSON.parse(serializer.to_json, symbolize_names: true)[:team]
  end

  it 'should have id' do
    expect(subject[:id]).to eql(resource.id)
  end

  it 'should have name' do
    expect(subject[:name]).to eql(resource.name)
  end

  it 'should have first player id' do
    expect(subject[:first_player][:id]).to eql(resource.first_player.id)
  end

  it 'should have first player name' do
    expect(subject[:first_player][:name]).to eql(resource.first_player.name)
  end

  it 'should have second player id' do
    expect(subject[:second_player][:id]).to eql(resource.second_player.id)
  end

  it 'should have second player name' do
    expect(subject[:second_player][:name]).to eql(resource.second_player.name)
  end
end
