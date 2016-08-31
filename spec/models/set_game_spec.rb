# == Schema Information
#
# Table name: set_games
#
#  id               :integer          not null, primary key
#  ordinal          :integer          not null
#  match_set_id     :integer          not null
#  team_winner_id   :integer
#  created_at       :datetime         not null
#  updated_at       :datetime         not null
#  player_server_id :integer
#  tiebreaker       :boolean          default(FALSE), not null
#

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
