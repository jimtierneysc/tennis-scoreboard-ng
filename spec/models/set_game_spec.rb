require 'rails_helper'

RSpec.describe SetGame, { type: :model } do
  subject { FactoryGirl.build(:set_game) }

  it { is_expected.to respond_to(:ordinal) }

  it { is_expected.to respond_to(:match_set) }

  it { is_expected.to respond_to(:team_winner) }

  it { is_expected.to respond_to(:tiebreaker) }

  it { is_expected.to respond_to(:player_server) }

  it { is_expected.to validate_presence_of(:ordinal) }

  it { is_expected.to validate_presence_of(:match_set) }

  describe '#destroy!' do
    before { subject.save! }

    it 'should remove set' do
      expect { subject.destroy! }.to change { SetGame.count }.by(-1)
    end
  end
end
