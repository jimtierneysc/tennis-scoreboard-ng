require 'rails_helper'

RSpec.describe MatchSet, { type: :model } do
  subject { FactoryGirl.build(:match_set) }

  it { is_expected.to respond_to(:ordinal) }

  it { is_expected.to respond_to(:scoring) }

  it { is_expected.to validate_presence_of(:ordinal) }

  it { is_expected.to validate_presence_of(:scoring) }

  it { is_expected.to validate_presence_of(:match) }

  it { is_expected.to respond_to(:match) }

  it 'should be valid initially' do
    is_expected.to be_valid
  end

  it 'should validate scoring value' do
    subject.scoring = 'abc'
    is_expected.to_not be_valid
  end

  describe '#destroy!' do
    before do
      subject.save!
    end

    it 'should remove set' do
      expect { subject.destroy! }.to change { MatchSet.count }.by(-1)
    end
  end
end
