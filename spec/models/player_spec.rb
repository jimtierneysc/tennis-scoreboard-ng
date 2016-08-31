# == Schema Information
#
# Table name: players
#
#  id         :integer          not null, primary key
#  name       :string           not null
#  created_at :datetime         not null
#  updated_at :datetime         not null
#

require 'rails_helper'

RSpec.describe Player, { type: :model } do
  subject { FactoryGirl.build :player  }

  it { is_expected.to respond_to(:name) }

  it { is_expected.to validate_presence_of(:name) }

  it { is_expected.to validate_uniqueness_of(:name).ignoring_case_sensitivity }

  describe '#singles_team' do
    before { subject.singles_team! }

    it 'should create singles team' do
      expect(subject.singles_team).not_to be_nil
    end

    it 'should destroy singles team' do
      expect { subject.destroy! }.to change { Team.count }.by(-1)
    end
  end

  describe '#destroy!' do
    before { subject.save! }

    it 'should remove player' do
      expect { subject.destroy! }.to change { Player.count }.by(-1)
    end

    context 'when referenced by team' do
      before do
        @team = FactoryGirl.build(:doubles_team, first_player_name: subject.name)
        @team.save!
      end

      it 'should not destroy player' do
        expect { subject.destroy! }.to raise_error(ActiveRecord::RecordNotDestroyed)
      end
    end

    context 'when referenced by match' do
      before do
        @match = FactoryGirl.build(:singles_match, first_player_name: subject.name)
        @match.save!
      end

      it 'should not destroy player' do
        expect { subject.destroy! }.to raise_error(ActiveRecord::RecordNotDestroyed)
      end
    end
  end
end
