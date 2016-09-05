require 'rails_helper'
require 'play_match'

RSpec.describe PlayMatch, { type: :model } do

  describe '::convert_scores' do
    subject { PlayMatch.convert_scores([[1, 2]]) }

    it 'should convert scores' do
      expect(subject).to eq([%w(w l l)])
    end

  end

  describe '::play_match' do
    before do
      PlayMatch.play_match(match, scores)
    end

    subject { match }

    context 'eight game pro set' do
      let(:scores) { PlayMatch.convert_scores([[0, 8]]) }
      context 'singles' do
        let(:match) { FactoryGirl.build(:singles_match, scoring: :one_eight_game) }

        it 'should have winner' do
          expect(subject.team_winner).to_not be_nil
        end
      end

      context 'doubles' do
        let(:match) { FactoryGirl.build(:doubles_match, scoring: :one_eight_game) }

        it 'should have winner' do
          expect(subject.team_winner).to_not be_nil
        end
      end
    end

    context 'two sets' do
      let(:scores) { PlayMatch.convert_scores([[0, 6], [6, 0], [1, 0]]) }
      context 'singles' do
        let(:match) { FactoryGirl.build(:singles_match, scoring: :two_six_game_ten_point) }

        it 'should have winner' do
          expect(subject.team_winner).to_not be_nil
        end
      end

      context 'doubles' do
        let(:match) { FactoryGirl.build(:doubles_match, scoring: :two_six_game_ten_point) }

        it 'should have winner' do
          expect(subject.team_winner).to_not be_nil
        end
      end
    end

    context 'three sets' do
      let(:scores) { PlayMatch.convert_scores([[0, 6], [6, 0], [6, 0]]) }
      context 'singles' do
        let(:match) { FactoryGirl.build(:singles_match, scoring: :three_six_game) }

        it 'should have winner' do
          expect(subject.team_winner).to_not be_nil
        end
      end

      context 'doubles' do
        let(:match) { FactoryGirl.build(:doubles_match, scoring: :three_six_game) }

        it 'should have winner' do
          expect(subject.team_winner).to_not be_nil
        end
      end
    end
  end

  context 'invalid score' do
    let(:scores) { PlayMatch.convert_scores([[0, 7]]) }
    let(:match) { FactoryGirl.build(:singles_match, scoring: :three_six_game) }

    it 'should raise error' do
      expect{PlayMatch.play_match(match, scores)}.to raise_error StandardError
    end
  end

end


