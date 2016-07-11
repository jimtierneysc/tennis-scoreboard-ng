require 'rails_helper'

RSpec.describe Match, type: :model do

  shared_examples "match" do

    it 'has #title' do
      is_expected.to respond_to(:title)
    end

    it 'has #doubles' do
      is_expected.to respond_to(:doubles)
    end

    it 'has #team_winner' do
      is_expected.to respond_to(:team_winner)
    end

    it 'has #scoring' do
      is_expected.to respond_to(:scoring)
    end

    it 'validates presence of #scoring' do
      is_expected.to validate_presence_of(:scoring)
    end

    it 'has #first_team' do
      is_expected.to respond_to(:first_team)
    end

    it 'has #second_team' do
      is_expected.to respond_to(:second_team)
    end

    it 'has #first_singles_player' do
      is_expected.to respond_to(:first_singles_player)
    end

    it 'has #second_singles_player' do
      is_expected.to respond_to(:second_singles_player)
    end

    it 'is valid' do
      is_expected.to be_valid
    end

    it 'validates unique #title' do
      is_expected.to validate_uniqueness_of(:title).ignoring_case_sensitivity
    end

    it 'validates known scoring' do
      subject.scoring = 'abc'
      is_expected.to_not be_valid
    end

    describe '#destroy!' do
      before(:each) do
        subject.save!
      end

      it 'removes match' do
        expect { subject.destroy! }.to change { Match.count }.by(-1)
      end
    end
  end

  context 'doubles match' do
    subject { FactoryGirl.build(:doubles_match) }

    it_behaves_like 'match'

    it 'validates presence of #first_team' do
      is_expected.to validate_presence_of(:first_team)
    end

    it 'validates presence of #second_team' do
      is_expected.to validate_presence_of(:second_team)
    end
  end

  context 'singles match' do
    subject { FactoryGirl.build(:singles_match) }

    it_behaves_like 'match'

    it 'validates presence of #second_singles_player' do
      is_expected.to validate_presence_of(:first_singles_player)
    end

    it 'validates presence of #second_singles_player' do
      is_expected.to validate_presence_of(:second_singles_player)
    end
  end
end
