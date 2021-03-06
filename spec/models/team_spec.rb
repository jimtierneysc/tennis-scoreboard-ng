# == Schema Information
#
# Table name: teams
#
#  id               :integer          not null, primary key
#  name             :string
#  first_player_id  :integer          not null
#  second_player_id :integer
#  created_at       :datetime         not null
#  updated_at       :datetime         not null
#  doubles          :boolean          default(FALSE), not null
#

require 'rails_helper'

RSpec.describe Team, { type: :model } do
  subject { FactoryGirl.build(:doubles_team) }

  it { is_expected.to respond_to(:name) }

  it { is_expected.to respond_to(:first_player) }

  it { is_expected.to respond_to(:second_player) }

  it { is_expected.to respond_to(:doubles) }

  it { is_expected.to validate_uniqueness_of(:name).ignoring_case_sensitivity }

  it { is_expected.to validate_presence_of(:first_player) }

  it 'should be valid initially' do
    is_expected.to be_valid
  end

  it 'should validate presence of #second_player' do
    subject.second_player = nil
    is_expected.to_not be_valid
  end

  it 'should validate existence of #first_player' do
    subject.first_player_id = 0
    is_expected.not_to be_valid
  end

  it 'should validate existence of #second_player' do
    subject.second_player_id = 0
    is_expected.not_to be_valid
  end

  it 'should validate to have two different players' do
    subject.second_player = subject.first_player
    is_expected.to_not be_valid
  end

  context 'when already have a team with players' do
    it 'should validate duplicate players in same order' do
      FactoryGirl.build(:doubles_team, name: 'other team').save!
      is_expected.to_not be_valid
    end

    it 'should validate duplicate players in reverse order' do
      FactoryGirl.build(:doubles_team, first_player_name: subject.second_player.name,
                        second_player_name: subject.first_player.name).save!
      is_expected.to_not be_valid
    end
  end

  context 'when in a match' do
    let(:player_name) { 'all new player' }
    let(:new_player) { FactoryGirl.create(:player, name: player_name) }
    let(:match) { FactoryGirl.build(:doubles_match, first_team_name: subject.name) }
    before do
      subject.save!
      match.save!
    end

    context 'when started' do
      before do
        match.play_match! :start_play
      end
      it 'should validate cannot change #second_player' do
        subject.second_player = new_player
        is_expected.to_not be_valid
      end

      it 'should validate cannot change #first_player' do
        subject.first_player = new_player
        is_expected.to_not be_valid
      end
    end

    context 'when not started' do
      it 'should validate can change #second_player' do
        subject.second_player = new_player
        is_expected.to be_valid
      end

      it 'should validate can change #first_player' do
        subject.first_player = new_player
        is_expected.to be_valid
      end
    end
  end

  describe '#destroy!' do
    before { subject.save! }

    it 'should remove team' do
      expect { subject.destroy! }.to change { Team.count }.by(-1)
    end

    context 'when referenced by match' do
      before do
        FactoryGirl.build(:doubles_match, first_team_name: subject.name).save!
      end

      it 'should not remove team' do
        expect { subject.destroy! }.to raise_error(ActiveRecord::RecordNotDestroyed)
      end
    end
  end
end
