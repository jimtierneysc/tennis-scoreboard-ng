require 'rails_helper'

RSpec.describe Match, type: :model do

  let(:player_name) {'player'}
  let(:team_name) {'team'}
  let(:new_player) { FactoryGirl.create(:player, name: player_name) }
  let(:new_team) { FactoryGirl.create(:doubles_team, name: team_name, first_player_name: player_name) }

  shared_examples 'match' do
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

    it 'has #first_player' do
      is_expected.to respond_to(:first_player)
    end

    it 'has #second_player' do
      is_expected.to respond_to(:second_player)
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
      before { subject.save! }

      it 'removes match' do
        expect { subject.destroy! }.to change { Match.count }.by(-1)
      end
    end

    it 'generates a default title' do
      subject.title = nil
      subject.save!
      expect(subject.title).to start_with('Match')
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

    it 'validates existence of #first_team' do
      subject.first_team_id = 0
      is_expected.not_to be_valid
    end

    it 'validates existence of #second_team' do
      subject.second_team_id = 0
      is_expected.not_to be_valid
    end

    it 'validates that teams can\'t be the same' do
      subject.first_team = subject.second_team
      is_expected.not_to be_valid
    end

    it 'validates that servers can\'t be the same' do
      subject.first_player_server = subject.first_team.first_player
      subject.second_player_server = subject.first_player_server
      is_expected.not_to be_valid
    end
  end

  context 'singles match' do
    subject { FactoryGirl.build(:singles_match) }

    it_behaves_like 'match'

    it 'validates presence of #first_player' do
      is_expected.to validate_presence_of(:first_player)
    end

    it 'validates presence of #second_player' do
      is_expected.to validate_presence_of(:second_player)
    end

    it 'validates existence of #first_player' do
      subject.first_team_id = 0
      is_expected.not_to be_valid
    end

    it 'validates existence of #second_player' do
      subject.second_team_id = 0
      is_expected.not_to be_valid
    end

    it 'validates that players can\'t be the same' do
      subject.first_player = subject.second_player
      is_expected.not_to be_valid
    end
  end

  context 'match in progress' do
    context 'singles' do
      subject { FactoryGirl.build(:play_singles_match, start_play: true) }

      it 'validates cannot change #scoring' do
        subject.scoring = :three_six_game
        is_expected.to_not be_valid
      end

      it 'validates cannot change #doubles' do
        subject.doubles = true
        is_expected.to_not be_valid
      end

      it 'validates cannot change #second_player' do
        subject.second_player = new_player
        is_expected.to_not be_valid
      end

      it 'validates cannot change #first_player' do
        subject.first_player = new_player
        is_expected.to_not be_valid
      end

      it 'validates can change server' do
        subject.first_player_server = subject.second_player
        is_expected.to be_valid
      end

      context 'start game' do
        before do
          subject.play_match! :start_game, subject.first_player
          subject.play_match! :win_game, subject.first_player
        end

        it 'validates cannot change server' do
          subject.first_player_server = subject.second_player
          is_expected.not_to be_valid
        end
      end
    end

    context 'doubles' do
      subject { FactoryGirl.build(:play_doubles_match, start_play: true) }

      it 'validates cannot change #first_team' do
        subject.first_team_id = new_team.id
        is_expected.to_not be_valid
      end

      it 'validates cannot change #second_team' do
        subject.second_team.id = new_team.id
        is_expected.to_not be_valid
      end

      it 'validates cannot change #scoring' do
        subject.scoring = :three_six_game
        is_expected.to_not be_valid
      end

      it 'validates can change first server' do
        subject.first_player_server = subject.first_team.first_player
        is_expected.to be_valid
      end

      context 'win first game' do
        before do
          subject.play_match! :start_game, subject.first_team.first_player
          subject.play_match! :win_game, subject.first_team.first_player
        end

        it 'validates cannot change first server' do
          subject.first_player_server = subject.first_team.second_player
          is_expected.not_to be_valid
        end

        it 'validates can change second server' do
          subject.second_player_server = subject.second_team.second_player
          is_expected.to be_valid
        end

        context 'start second game' do
          before do
            subject.play_match! :start_game, subject.second_team.first_player
            subject.play_match! :win_game, subject.first_team.first_player
          end

          it 'validates cannot change second server' do
            subject.second_player_server = subject.second_team.second_player
            is_expected.not_to be_valid
          end
        end
      end
    end
  end
end
