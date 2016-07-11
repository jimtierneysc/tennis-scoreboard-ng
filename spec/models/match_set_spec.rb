require 'rails_helper'

RSpec.describe MatchSet, type: :model do
  subject { FactoryGirl.build(:match_set) }

  it 'has #ordinal' do
    is_expected.to respond_to(:ordinal)
  end

  it 'has #scoring' do
    is_expected.to respond_to(:scoring)
  end

  it 'validates presence of #ordinal' do
    is_expected.to validate_presence_of(:ordinal)
  end

  it 'validates presence of #scoring' do
    is_expected.to validate_presence_of(:scoring)
  end

  it 'validates presence of #match' do
    is_expected.to validate_presence_of(:match)
  end

  it 'has #match' do
    is_expected.to respond_to(:match)
  end

  it 'validates known scoring' do
    subject.scoring = 'abc'
    is_expected.to_not be_valid
  end

  describe '#destroy!' do
    before(:each) do
      subject.save!
    end

    it 'removes set' do
      expect { subject.destroy! }.to change { MatchSet.count }.by(-1)
    end
  end
end
