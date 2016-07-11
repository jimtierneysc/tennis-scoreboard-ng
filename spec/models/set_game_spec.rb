require 'rails_helper'

RSpec.describe SetGame, type: :model do
  before {
    @set_game = FactoryGirl.build(:set_game)
  }

  subject { @set_game }

  it 'has #ordinal' do
    is_expected.to respond_to(:ordinal)
  end

  it 'has #match_set' do
    is_expected.to respond_to(:match_set)
  end

  it 'has #team_winner' do
    is_expected.to respond_to(:team_winner)
  end

  it 'has #tiebreaker' do
    is_expected.to respond_to(:tiebreaker)
  end

  it 'has #player_server' do
    is_expected.to respond_to(:player_server)
  end

  it 'validates presence of #ordinal' do
    is_expected.to validate_presence_of(:ordinal)
  end

  it 'validates presence of #match_set' do
    is_expected.to validate_presence_of(:match_set)
  end

  describe '#destroy!' do
    before(:each) do
      subject.save!
    end

    it 'removes set' do
      expect { subject.destroy! }.to change { SetGame.count }.by(-1)
    end
  end
end
