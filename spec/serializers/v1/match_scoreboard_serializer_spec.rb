require 'rails_helper'
require 'serializers/v1/match_serializer_shared'

RSpec.describe V1::MatchScoreboardSerializer, { type: :serializer, match_serializer_shared: true } do

  def scoreboard_json(match)
    serializer = V1::MatchScoreboardSerializer.new(match)
    JSON.parse(serializer.to_json, symbolize_names: true)
  end

  describe 'empty match' do
    context 'doubles' do
      let(:match) { FactoryGirl.create :doubles_match }

      subject do
        scoreboard_json(match)
      end

      it_behaves_like 'a doubles scoreboard'

      it { is_expected.to eql_match(match) }
    end

    context 'singles' do
      let(:match) { FactoryGirl.create :singles_match }

      subject do
        scoreboard_json(match)
      end

      it_behaves_like 'a singles scoreboard'

      it { is_expected.to eql_match(match) }
    end
  end

  describe 'complete match' do
    context 'doubles' do
      let(:match) { FactoryGirl.create :play_doubles_match,
                                       scoring: :two_six_game_ten_point,
                                       scores: [[7, 6],[4, 6],[1, 0]]}

      subject do
        scoreboard_json(match)
      end

      it_behaves_like 'a doubles scoreboard'

      it { is_expected.to eql_match(match) }
    end

    context 'singles' do
      let(:match) { FactoryGirl.create :play_singles_match,
                                       scoring: :two_six_game_ten_point,
                                       scores: [[7, 6], [4, 6], [1, 0]]}

      subject do
        scoreboard_json(match)
      end

      it_behaves_like 'a singles scoreboard'

      it { is_expected.to eql_match(match) }
    end
  end

  describe 'near winners' do
    context 'doubles' do
      let(:match) { FactoryGirl.create :play_doubles_match,
                                       scoring: :two_six_game_ten_point,
                                       scores: [[7, 6],[4, 6], [0, 0]]}

      subject do
        scoreboard_json(match)
      end

      it_behaves_like 'a doubles scoreboard'

      it { is_expected.to eql_match(match) }
    end

    context 'singles' do
      let(:match) { FactoryGirl.create :play_singles_match,
                                       scoring: :two_six_game_ten_point,
                                       scores: [[7, 6], [4, 6], [0, 0]]}

      subject do
        scoreboard_json(match)
      end

      it_behaves_like 'a singles scoreboard'

      it { is_expected.to eql_match(match) }
    end
  end



end


