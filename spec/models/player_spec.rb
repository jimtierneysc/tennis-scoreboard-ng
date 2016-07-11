require 'rails_helper'

RSpec.describe Player, type: :model do
  before {
    @player = FactoryGirl.build(:player)
  }
  subject { @player }

  it 'has #name' do
    is_expected.to respond_to(:name)
  end

  it 'is valid' do
    is_expected.to be_valid
  end

  it 'validates presence of #name' do
    is_expected.to validate_presence_of(:name)
  end

  it 'validates unique #name' do
    is_expected.to validate_uniqueness_of(:name).ignoring_case_sensitivity
  end

  describe '#singles_team' do
    before(:each) do
      subject.singles_team!
    end

    it 'creates singles team' do
      expect(subject.singles_team).not_to be_nil
    end

    it 'destroys singles team' do
      expect { subject.destroy! }.to change { Team.count }.by(-1)
    end
  end

  describe '#destroy!' do
    before(:each) do
      subject.save!
    end

    it 'removes player' do
      expect { subject.destroy! }.to change { Player.count }.by(-1)
    end

    context 'when referenced by team' do
      before(:each) do
        @team = FactoryGirl.build(:doubles_team, first_player_name: subject.name)
        @team.save!
      end

      it 'cannot remove player' do
        expect { subject.destroy! }.to raise_error(ActiveRecord::RecordNotDestroyed)
      end
    end

    context 'when referenced by match' do
      before(:each) do
        @match = FactoryGirl.build(:singles_match, first_player_name: subject.name)
        @match.save!
      end

      it 'cannot destroy player' do
        expect { subject.destroy! }.to raise_error(ActiveRecord::RecordNotDestroyed)
      end
    end
  end
end
