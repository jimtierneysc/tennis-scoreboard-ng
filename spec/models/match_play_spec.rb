require 'rails_helper'
require 'models/match_play_shared'


# Test match scoring

RSpec.describe 'Match Play', type: :model do
  describe 'empty match' do
    subject { FactoryGirl.build(:play_singles_match) }

    it_behaves_like 'a match not started'
  end

  describe 'start match' do
    subject { FactoryGirl.build(:play_singles_match, start_play: true) }

    it_behaves_like 'a match just started'

    context 'remove last change' do
      before { subject.change_score! :remove_last_change }
      it_behaves_like 'a match not started'
    end

    context 'discard play' do
      before { subject.change_score! :discard_play }
      it_behaves_like 'a match not started'
    end
  end

  describe 'start game' do
    context 'singles match' do
      subject { FactoryGirl.build(:play_singles_match, start_play: true) }

      context 'start game with first server' do
        before do
          subject.change_score! :start_next_game, subject.first_player
        end

        it_behaves_like 'a match with first game started'

        context 'remove last change' do
          before { subject.change_score! :remove_last_change }
          it_behaves_like 'a match just started'
        end
      end

      context 'start game without server' do
        it 'does not start' do
          expect { subject.change_score! :start_next_game }.to raise_error Exceptions::InvalidOperation
        end
      end

      context 'restart play' do
        before { subject.change_score! :restart_play }
        it_behaves_like 'a match just started'
      end
    end

    context 'doubles match' do
      subject { FactoryGirl.build(:play_doubles_match, start_play: true) }

      context 'start first game with first server' do
        before do
          subject.change_score! :start_next_game, subject.first_team.first_player
        end

        it_behaves_like 'a match with first game started'

        context 'remove last change' do
          before { subject.change_score! :remove_last_change }
          it_behaves_like 'a match just started'
        end

        context 'start second game' do
          before { subject.change_score! :win_game, subject.first_team }

          context 'start second game with second server' do
            before do
              subject.change_score! :start_next_game, subject.second_team.first_player
            end

            it_behaves_like 'a match with second game started'

            context 'remove last change' do
              before {
                subject.change_score! :remove_last_change
              }
              it_behaves_like 'a match with game won'
            end
          end

          context 'start second game without server' do
            it 'does not start' do
              expect { subject.change_score! :start_next_game }.to raise_error Exceptions::InvalidOperation
            end
          end

          context 'start second game with invalid server' do
            it 'does not allow same server' do
              expect { subject.change_score! :start_next_game, subject.first_team.first_player }.to raise_error ActiveRecord::RecordInvalid
            end

            it 'does not allow server from same team' do
              expect { subject.change_score! :start_next_game, subject.first_team.second_player }.to raise_error ActiveRecord::RecordInvalid
            end
          end
        end
      end

      context 'start first game without server' do
        it 'does not start' do
          expect { subject.change_score! :start_next_game }.to raise_error Exceptions::InvalidOperation
        end
      end
    end
  end

  describe 'win game' do
    subject { FactoryGirl.build(:play_singles_match, start_first_game: true) }

    context 'win game with player' do
      before { subject.change_score! :win_game, subject.first_team }

      it_behaves_like 'a match with game won'
    end

    context 'win game without player' do
      it 'does not win' do
        expect { subject.change_score! :win_game }.to raise_error Exceptions::UnknownOperation
      end
    end
  end

  describe 'complete set' do
    subject do
      FactoryGirl.build(:play_singles_match, scoring: :three_six_game,
                        scores: [[6, 0]], complete_set: false)
    end

    it_behaves_like 'a match set can be completed'

    context 'complete play' do
      before { subject.change_score! :complete_set_play }

      it_behaves_like 'a match with complete set'

      context 'remove last change' do
        before { subject.change_score! :remove_last_change }
        it_behaves_like 'a match set can be completed'
      end
    end
  end

  describe 'set tiebreaker' do
    subject do
      FactoryGirl.build(:play_singles_match, scoring: :one_eight_game,
                        scores: [[8, 8]])
    end

    it_behaves_like 'a match can start set tiebreaker'

    context 'start tiebreaker' do
      before { subject.change_score! :start_tiebreaker }

      it_behaves_like 'a match in set tiebreaker'

      context 'win tiebreaker with player' do
        before { subject.change_score! :win_tiebreaker, subject.first_team }

        it_behaves_like 'a match with finished set'

        context 'remove last change' do
          before { subject.change_score! :remove_last_change }
          it_behaves_like 'a match in set tiebreaker'
        end
      end

      context 'win tiebreaker without player' do
        it 'does not win' do
          expect { subject.change_score! :win_tiebreaker }.to raise_error Exceptions::UnknownOperation
        end
      end

      context 'remove last change' do
        before do
          subject.change_score! :remove_last_change
          subject.reload
        end
        it_behaves_like 'a match can start set tiebreaker'
      end
    end
  end

  describe 'match tiebreaker' do
    subject do
      FactoryGirl.build(:play_singles_match,
                        scoring: :two_six_game_ten_point, scores: [[6, 0], [0, 6]])
    end

    it_behaves_like 'a match can start match tiebreaker'

    context 'start match tiebreaker' do
      before { subject.change_score! :start_match_tiebreaker }

      it_behaves_like 'a match in match tiebreaker'

      context 'win match tiebreaker with player' do
        before do
          subject.change_score! :win_match_tiebreaker, subject.first_team
        end

        it_behaves_like 'a match finished'

        context 'remove last change' do
          before { subject.change_score! :remove_last_change }
          it_behaves_like 'a match in match tiebreaker'
        end

        context 'complete match tiebreaker' do
          before { subject.change_score! :complete_match_tiebreaker }
          it_behaves_like 'a match with complete set'

          context 'remove last change' do
            before { subject.change_score! :remove_last_change }
            it_behaves_like 'a match with finished set'
          end

        end
      end

      context 'win match tiebreaker without player' do
        it 'does not win' do
          expect { subject.change_score! :win_match_tiebreaker }.to raise_error Exceptions::UnknownOperation
        end
      end

      context 'remove last change' do
        before do
          subject.change_score! :remove_last_change
          subject.reload # clears destroyed entities
        end
        it_behaves_like 'a match can start match tiebreaker'
      end
    end
  end

  describe 'complete match' do
    context 'multiple set match' do
      subject do
        FactoryGirl.build(:play_singles_match, scoring: :three_six_game, scores: [[6, 0], [6, 0]],
                          complete_match: false)
      end

      it_behaves_like 'a match can be completed'

      context 'complete play' do
        before { subject.change_score! :complete_play }

        it_behaves_like 'a match complete'

        context 'remove last change' do
          before { subject.change_score! :remove_last_change }
          it_behaves_like 'a match can be completed'
        end
      end
    end

    context 'one set match' do
      subject do
        FactoryGirl.build(:play_singles_match, scoring: :one_eight_game, scores: [[8, 0]],
                          complete_match: false)
      end

      it_behaves_like 'a match can be completed'

      context 'complete play' do
        before { subject.change_score! :complete_play }

        it_behaves_like 'a match complete'

        context 'remove last change' do
          before { subject.change_score! :remove_last_change }

          it_behaves_like 'a match can be completed'
        end
      end
    end
  end

  describe 'first set servers' do
    context 'singles' do
      subject do
        FactoryGirl.build(:play_singles_match, scoring: :three_six_game, start_first_game: true)
      end

      context 'first game' do
        it_behaves_like 'a match with first player serving'
      end

      context 'second game' do
        before do
          subject.change_score! :win_game, subject.first_player
          subject.change_score! :start_next_game
        end

        it_behaves_like 'a match with second player serving'

        context 'third game' do
          before do
            subject.change_score! :win_game, subject.first_player
            subject.change_score! :start_next_game
          end

          it_behaves_like 'a match with first player serving'
        end
      end

    end
    context 'doubles' do
      subject do
        FactoryGirl.build(:play_doubles_match, scoring: :three_six_game, start_first_game: true)
      end
      let(:winner) { subject.first_team.first_player }

      context 'first game' do
        it_behaves_like 'a match with first player serving'
      end

      context 'second game' do
        before do
          subject.change_score! :win_game, winner
          subject.change_score! :start_next_game, subject.second_team.first_player
        end

        it_behaves_like 'a match with third player serving'

        context 'third game' do
          before do
            subject.change_score! :win_game, winner
            subject.change_score! :start_next_game
          end

          it_behaves_like 'a match with second player serving'

          context 'fourth game' do
            before {
              subject.change_score! :win_game, winner
              subject.change_score! :start_next_game
            }

            it_behaves_like 'a match with fourth player serving'

            context 'fifth game' do
              before do
                subject.change_score! :win_game, winner
                subject.change_score! :start_next_game
              end

              it_behaves_like 'a match with first player serving'
            end
          end
        end
      end
    end
  end

  describe 'second set servers' do
    context 'odd' do
      context 'singles' do
        subject do
          FactoryGirl.build(:play_singles_match, scoring: :three_six_game,
                            scores: [[6, 3]], start_next_set_game: true)
        end

        context 'first game' do
          it_behaves_like 'a match with second player serving'
        end

      end
      context 'doubles' do
        subject do
          FactoryGirl.build(:play_doubles_match, scoring: :three_six_game,
                            scores: [[6, 3]], start_next_set_game: true)
        end

        context 'first game' do
          it_behaves_like 'a match with third player serving'
        end
      end

    end
    context 'even' do
      context 'singles' do
        subject do
          FactoryGirl.build(:play_singles_match, scoring: :three_six_game,
                            scores: [[7, 5]], start_next_set_game: true)
        end

        context 'first game' do
          it_behaves_like 'a match with first player serving'
        end
      end

      context 'doubles' do
        subject do
          FactoryGirl.build(:play_doubles_match, scoring: :three_six_game,
                            scores: [[6, 4]], start_next_set_game: true)
        end

        context 'first game' do
          it_behaves_like 'a match with second player serving'
        end
      end
    end

    context 'tiebreaker' do
      context 'singles' do
        subject do
          FactoryGirl.build(:play_singles_match, scoring: :three_six_game,
                            scores: [[6, 7]], start_next_set_game: true)
        end

        context 'first game' do
          it_behaves_like 'a match with first player serving'
        end
      end

      context 'doubles' do
        subject do
          FactoryGirl.build(:play_doubles_match, scoring: :three_six_game,
                            scores: [[7, 6]], start_next_set_game: true)
        end

        context 'first game' do
          it_behaves_like 'a match with first player serving'
        end
      end
    end
  end
end
