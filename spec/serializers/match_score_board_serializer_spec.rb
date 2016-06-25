require 'rails_helper'
require 'serializers/match_serializer_shared'

RSpec.shared_examples "a scoreboard" do

  it 'has sets' do
    expect(subject.include? :sets).to be_truthy
  end

  it 'has actions' do
    expect(subject.include? :actions).to be_truthy
  end

  it 'errors' do
    expect(subject.include? :errors).to be_truthy
  end

  it 'has servers' do
    expect(subject.include? :servers).to be_truthy
  end

end


RSpec.describe MatchScoreBoardSerializer, ancestor: MatchSerializer do
  context "doubles" do
    let(:resource) { matches(:m_one_eight_game_doubles) } # fixture
    let(:serializer) { MatchScoreBoardSerializer.new(resource) }

    subject do
      JSON.parse(serializer.to_json, symbolize_names: true)[:match_score_board]
    end

    it_behaves_like "a doubles match"

    it_behaves_like "a scoreboard"

  end

  context "singles" do
    let(:resource) { matches(:m_one_eight_game_singles) } # fixture
    let(:serializer) { MatchScoreBoardSerializer.new(resource) }

    subject do
      JSON.parse(serializer.to_json, symbolize_names: true)[:match_score_board]
    end

    it_behaves_like "a singles match"

    it_behaves_like "a scoreboard"

  end
end
