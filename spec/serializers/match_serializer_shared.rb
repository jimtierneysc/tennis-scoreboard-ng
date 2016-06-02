require 'rails_helper'

RSpec.shared_examples "a match" do

  it 'has an id' do
    expect(subject['id']).to eql(resource.id)
  end

  it 'has title' do
    expect(subject['title']).to eql(resource.title)
  end

  it 'has doubles' do
    expect(subject['doubles']).to eql(resource.doubles)
  end

  it 'has state' do
    expect(subject['state']).to eql(resource.state.to_s)
  end

  it 'has scoring' do
    expect(subject['scoring']).to eql(resource.scoring.to_s)
  end

  it 'has winner' do
    expect(subject.include? 'winner').to be_truthy
  end

end


RSpec.shared_examples "a doubles match" do
  it_behaves_like "a match"


  it 'has doubles' do
    expect(subject['doubles']).to eql(true)
  end

  it 'has first team' do
    expect(subject['first_team']['id']).to eql(resource.first_team.id)
    expect(subject['first_team']['name']).to eql(resource.first_team.name)
  end

  it 'has second team' do
    expect(subject['second_team']['id']).to eql(resource.second_team.id)
    expect(subject['second_team']['name']).to eql(resource.second_team.name)
  end

end

RSpec.shared_examples "a singles match" do
  it_behaves_like "a match"

  it 'has singles' do
    expect(subject['doubles']).to eql(false)
  end

  it 'has first player' do
    expect(subject['first_player']['id']).to eql(resource.first_team.first_player.id)
    expect(subject['first_player']['name']).to eql(resource.first_team.first_player.name)
  end

  it 'has second player' do
    expect(subject['second_player']['id']).to eql(resource.second_team.first_player.id)
    expect(subject['second_player']['name']).to eql(resource.second_team.first_player.name)
  end

end