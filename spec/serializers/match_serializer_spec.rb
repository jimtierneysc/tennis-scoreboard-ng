require 'rails_helper'
require 'serializers/match_serializer_shared'

RSpec.describe MatchSerializer, :type => :serializer do
  context "doubles" do
    let(:resource) { matches(:m_one_eight_game_doubles) } # fixture
    let(:serializer) { MatchSerializer.new(resource) }

    subject do
      JSON.parse(serializer.to_json, symbolize_names: true)[:match]
    end

    it_behaves_like "a doubles match"
  end

  context "singles" do
    let(:resource) { matches(:m_one_eight_game_singles) } # fixture
    let(:serializer) { MatchSerializer.new(resource) }

    subject do
      JSON.parse(serializer.to_json, symbolize_names: true)[:match]
    end

    it_behaves_like "a singles match"
  end
end
