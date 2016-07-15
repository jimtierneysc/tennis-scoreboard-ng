require 'rails_helper'

RSpec.describe Team, type: :model do
  subject { FactoryGirl.build(:doubles_team) }

  it 'has #name' do
    is_expected.to respond_to(:name)
  end

  it 'has #first_player' do
    is_expected.to respond_to(:first_player)
  end

  it 'has #second_player' do
    is_expected.to respond_to(:second_player)
  end

  it 'has #double' do
    is_expected.to respond_to(:doubles)
  end

  it 'is valid' do
    is_expected.to be_valid
  end

  it 'validates unique #name' do
    is_expected.to validate_uniqueness_of(:name).ignoring_case_sensitivity
  end

  it 'validates presence of #second_player' do
    subject.second_player = nil
    is_expected.to_not be_valid
  end

  it 'validates presence of #first_player' do
    is_expected.to validate_presence_of(:first_player)
  end

  it 'validates existence of #first_player' do
    subject.first_player_id = 0
    is_expected.not_to be_valid
  end

  it 'validates existence of #second_player' do
    subject.second_player_id = 0
    is_expected.not_to be_valid
  end

  it 'validates two different players' do
    subject.second_player = subject.first_player
    is_expected.to_not be_valid
  end

  context 'when already have a team with players' do
    it 'validates duplicate players in same order' do
      FactoryGirl.build(:doubles_team, name: 'other team').save!
      is_expected.to_not be_valid
    end

    it 'validates duplicate players in reverse order' do
      FactoryGirl.build(:doubles_team, first_player_name: subject.second_player.name,
                        second_player_name: subject.first_player.name).save!
      is_expected.to_not be_valid
    end
  end

  it 'generates a default team name' do
    subject.name = nil
    subject.save!
    expect(subject.name).to start_with('Team')
  end

  describe '#destroy!' do
    before do
      subject.save!
    end

    it 'removes team' do
      expect { subject.destroy! }.to change { Team.count }.by(-1)
    end

    context 'when referenced by match' do
      before do
        @match = FactoryGirl.build(:doubles_match, first_team_name: subject.name)
        @match.save!
      end

      it 'cannot remove team' do
        expect { subject.destroy! }.to raise_error(ActiveRecord::RecordNotDestroyed)
      end
    end
  end
end
