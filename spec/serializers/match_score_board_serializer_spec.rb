require 'rails_helper'
require 'serializers/match_serializer_shared'

def scoreboard_json(match)
  serializer = MatchScoreBoardSerializer.new(match)
  JSON.parse(serializer.to_json, symbolize_names: true)[:match_score_board]
end

RSpec.describe MatchScoreBoardSerializer, ancestor: MatchSerializer do
  describe 'empty match' do
    context "doubles" do
      let(:match) { FactoryGirl.create :doubles_match }

      subject do
        scoreboard_json(match)
      end

      it_behaves_like "a doubles scoreboard"

      it 'equals match' do
        is_expected.to eql_match(match)
      end

    end

    context "singles" do
      let(:match) { FactoryGirl.create :singles_match }

      subject do
        scoreboard_json(match)
      end

      it_behaves_like "a singles scoreboard"

      it 'equals match' do
        is_expected.to eql_match(match)
      end
    end
  end

  describe 'complete match' do
    context "doubles" do
      let(:match) { FactoryGirl.create :play_doubles_match,
                                       scoring: :two_six_game_ten_point,
                                       scores: [[7, 6],[4, 6],[1, 0]]}

      subject do
        scoreboard_json(match)
      end

      it_behaves_like "a doubles scoreboard"

      it 'equals match' do
        is_expected.to eql_match(match)
      end

    end

    context "singles" do
      let(:match) { FactoryGirl.create :play_singles_match,
                                       scoring: :two_six_game_ten_point,
                                       scores: [[7, 6], [4, 6], [1, 0]]}

      subject do
        scoreboard_json(match)
      end

      it_behaves_like "a singles scoreboard"

      it 'equals match' do
        is_expected.to eql_match(match)
      end
    end
  end

end


