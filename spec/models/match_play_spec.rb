require 'rails_helper'
require 'models/match_play_shared'

# Test start match, start set, win game, etc.

RSpec.describe 'Play', { type: :model, match_play_shared: true, play_actions: true } do
  describe 'any match' do
    subject { FactoryGirl.build(:singles_match) }

    it_behaves_like 'a match not started'

    it 'should detect unknown action' do
      expect { subject.play_match? :xxx }.to raise_error Exceptions::UnknownOperation
    end

    it 'should respond with valid actions' do
      expect(subject.play_actions).to eq({ start_play: true })
    end

    context 'when attempt invalid actions' do
      actions = all_actions.reject do |a|
        first_actions.include?(a) or win_actions.include?(a)
      end
      actions.each do |action|
        context "when #{action}" do
          it 'should deny action' do
            expect { subject.play_match! action }.to raise_error Exceptions::InvalidOperation
          end
        end
      end
    end

  end

  describe 'start match' do
    subject { FactoryGirl.build(:play_singles_match, start_play: true) }

    it_behaves_like 'a match just started'

    context 'remove last change' do
      before { subject.play_match! :remove_last_change }
      it_behaves_like 'a match not started'
    end

    context 'discard play' do
      before { subject.play_match! :discard_play }
      it_behaves_like 'a match not started'
    end

    it 'should not start again' do
      expect { subject.play_match! :start_play }.to raise_error Exceptions::InvalidOperation
    end

    context 'when win actions are denied' do
      win_actions.each do |action|

        context "when #{action}" do
          it 'should deny action' do
            expect { subject.play_match! action, opponent: subject.first_team }.to raise_error Exceptions::InvalidOperation
          end
        end
      end
    end
  end

  describe 'start game' do
    context 'singles match' do
      subject { FactoryGirl.build(:play_singles_match, start_play: true) }

      context 'with first server' do
        before do
          subject.play_match! :start_game, player: subject.first_player
        end

        it_behaves_like 'a match with first game started'

        context 'remove last change' do
          before { subject.play_match! :remove_last_change }
          it_behaves_like 'a match just started'
        end
      end

      context 'without server' do
        it 'should not start' do
          expect { subject.play_match! :start_game }.to raise_error Exceptions::InvalidOperation
        end
      end

      context 'restart play' do
        before { subject.play_match! :restart_play }
        it_behaves_like 'a match just started'
      end
    end

    context 'doubles match' do
      subject { FactoryGirl.build(:play_doubles_match, start_play: true) }

      context 'start first game with first server' do
        before do
          subject.play_match! :start_game, player: subject.first_team.first_player
        end

        it_behaves_like 'a match with first game started'

        context 'remove last change' do
          before { subject.play_match! :remove_last_change }
          it_behaves_like 'a match just started'
        end

        context 'start second game' do
          before { subject.play_match! :win_game, opponent: subject.first_team }

          context 'start second game with second server' do
            before do
              subject.play_match! :start_game, player: subject.second_team.first_player
            end

            it_behaves_like 'a match with second game started'

            context 'remove last change' do
              before {
                subject.play_match! :remove_last_change
              }
              it_behaves_like 'a match with game won'
            end
          end

          context 'second game without server' do
            it 'should not start' do
              expect { subject.play_match! :start_game }.to raise_error Exceptions::InvalidOperation
            end
          end

          context 'second game with invalid server' do
            it 'should not allow same server' do
              expect { subject.play_match! :start_game, player: subject.first_team.first_player }.to raise_error ActiveRecord::RecordInvalid
            end

            it 'should not allow server from same team' do
              expect { subject.play_match! :start_game, player: subject.first_team.second_player }.to raise_error ActiveRecord::RecordInvalid
            end
          end
        end
      end

      context 'first game without server' do
        it 'should not start' do
          expect { subject.play_match! :start_game }.to raise_error Exceptions::InvalidOperation
        end
      end
    end
  end

  describe 'win game' do
    subject { FactoryGirl.build(:play_singles_match, start_first_game: true) }

    it_behaves_like 'a match with game in progress'

    context 'with player' do
      before { subject.play_match! :win_game, opponent: subject.first_team.first_player }

      it_behaves_like 'a match with game won'

      context 'remove last change' do
        before { subject.play_match! :remove_last_change }

        it_behaves_like 'a match with game in progress'
      end
    end

    context 'without player' do
      it 'should not win' do
        expect { subject.play_match! :win_game }.to raise_error Exceptions::UnknownOperation
      end
    end
  end

  describe 'complete set' do

    context 'multiple set match' do
      subject do
        FactoryGirl.build(:play_singles_match, scoring: :three_six_game,
                          scores: [[6, 0]], complete_set: false)
      end

      it_behaves_like 'a match set can be completed'

      context 'complete play' do
        before { subject.play_match! :complete_set_play }

        it_behaves_like 'a match with complete set'

        context 'remove last change' do
          before { subject.play_match! :remove_last_change }
          it_behaves_like 'a match set can be completed'
        end
      end
    end

    context 'single set match' do
      subject do
        FactoryGirl.build(:play_singles_match, scoring: :one_eight_game,
                          scores: [[8, 0]], complete_match: false)
      end

      it_behaves_like 'a match with finished set'

      context 'remove last change' do
        before {
          subject.play_match! :remove_last_change
        }
        it_behaves_like 'a match with game in progress'
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
      before { subject.play_match! :start_tiebreaker }

      it_behaves_like 'a match in set tiebreaker'

      context 'win tiebreaker with player' do
        before { subject.play_match! :win_tiebreaker, opponent: subject.first_team }

        it_behaves_like 'a match with finished set'

        context 'remove last change' do
          before { subject.play_match! :remove_last_change }
          it_behaves_like 'a match in set tiebreaker'
        end

        it 'should not win tiebreaker again' do
          expect {
            subject.play_match! :win_tiebreaker, opponent: subject.first_team
          }.to raise_error Exceptions::InvalidOperation
        end
      end

      context 'win tiebreaker without player' do
        it 'should not win' do
          expect { subject.play_match! :win_tiebreaker }.to raise_error Exceptions::UnknownOperation
        end
      end

      context 'remove last change' do
        before do
          subject.play_match! :remove_last_change
          subject.reload
        end
        it_behaves_like 'a match can start set tiebreaker'
      end
    end
  end

  describe 'remove second set' do
    subject do
      FactoryGirl.build(:play_singles_match,
                        scoring: :two_six_game_ten_point, scores: [[6, 0]], complete_set: true)
    end

    it_behaves_like 'a match with one set'

    context 'start second set' do
      before { subject.play_match! :start_set }

      it_behaves_like 'a match with two sets'

      context 'remove started set' do
        before do
          subject.play_match! :remove_last_change
          subject.reload
        end

        it_behaves_like 'a match with one set'
      end
    end
  end

  describe 'match tiebreaker' do
    subject do
      FactoryGirl.build(:play_singles_match,
                        scoring: :two_six_game_ten_point, scores: [[6, 0], [0, 6]])
    end

    it_behaves_like 'a match can start match tiebreaker'

    context 'start ' do
      before { subject.play_match! :start_match_tiebreaker }

      it_behaves_like 'a match in match tiebreaker'

      context 'win with player' do
        before do
          subject.play_match! :win_match_tiebreaker, opponent: subject.first_team
        end

        it_behaves_like 'a match finished'

        context 'remove last change' do
          before { subject.play_match! :remove_last_change }
          it_behaves_like 'a match in match tiebreaker'
        end

        context 'complete match tiebreaker' do
          before { subject.play_match! :complete_match_tiebreaker }
          it_behaves_like 'a match with complete set'

          context 'remove last change' do
            before { subject.play_match! :remove_last_change }
            it_behaves_like 'a match with finished set'
          end
        end

        it 'should not win again' do
          expect {
            subject.play_match! :win_match_tiebreaker, opponent: subject.first_team
          }.to raise_error Exceptions::InvalidOperation
        end
      end

      context 'win without player' do
        it 'should not win' do
          expect { subject.play_match! :win_match_tiebreaker }.to raise_error Exceptions::UnknownOperation
        end
      end

      context 'remove last change' do
        before do
          subject.play_match! :remove_last_change
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
        before { subject.play_match! :complete_play }

        it_behaves_like 'a match complete'

        context 'remove last change' do
          before { subject.play_match! :remove_last_change }
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
        before { subject.play_match! :complete_play }

        it_behaves_like 'a match complete'

        context 'remove last change' do
          before { subject.play_match! :remove_last_change }

          it_behaves_like 'a match can be completed'
        end
      end
    end
  end

  describe 'players serving first set' do
    context 'singles' do
      context 'alternate order' do # needed for complete code coverage
        let(:winner) { subject.first_player.singles_team }
        subject do
          FactoryGirl.build(:play_singles_match, scoring: :three_six_game, start_play: true)
        end

        context 'first' do
          before do
            subject.play_match! :start_game, player: subject.second_player
          end
          it_behaves_like 'a match with second player serving'

          context 'second' do
            before do
              subject.play_match! :win_game, opponent: winner
              subject.play_match! :start_game
            end

            it_behaves_like 'a match with first player serving'

            context 'third' do
              before do
                subject.play_match! :win_game, opponent: winner
                subject.play_match! :start_game
              end

              it_behaves_like 'a match with second player serving'
            end
          end
        end
      end

      context 'sequential order' do
        let(:winner) { subject.first_player.singles_team }
        subject do
          FactoryGirl.build(:play_singles_match, scoring: :three_six_game, start_first_game: true)
        end

        context 'first' do
          it_behaves_like 'a match with first player serving'
        end

        context 'second' do
          before do
            subject.play_match! :win_game, opponent: winner
            subject.play_match! :start_game
          end

          it_behaves_like 'a match with second player serving'

          context 'third' do
            before do
              subject.play_match! :win_game, opponent: winner
              subject.play_match! :start_game
            end

            it_behaves_like 'a match with first player serving'
          end
        end
      end
    end

    context 'doubles' do
      context 'alternate order' do # needed for complete code coverage
        let(:winner) { subject.first_team }
        subject do
          FactoryGirl.build(:play_doubles_match, scoring: :three_six_game, start_play: true)
        end

        context 'first' do
          before do
            subject.play_match! :start_game, player: subject.first_team.second_player
          end
          it_behaves_like 'a match with second player serving'

          context 'second' do
            before do
              subject.play_match! :win_game, opponent: winner
              subject.play_match! :start_game, player: subject.second_team.first_player
            end
            it_behaves_like 'a match with third player serving'

            context 'third' do
              before do
                subject.play_match! :win_game, opponent: winner
                subject.play_match! :start_game
              end
              it_behaves_like 'a match with first player serving'

              context 'fourth' do
                before do
                  subject.play_match! :win_game, opponent: winner
                  subject.play_match! :start_game
                end
                it_behaves_like 'a match with fourth player serving'

                context 'fifth' do
                  before do
                    subject.play_match! :win_game, opponent: winner
                    subject.play_match! :start_game
                  end
                  it_behaves_like 'a match with second player serving'
                end
              end
            end
          end
        end
      end

      context 'sequential order' do
        let(:winner) { subject.first_team }
        subject do
          FactoryGirl.build(:play_doubles_match, scoring: :three_six_game, start_first_game: true)
        end

        context 'first' do
          it_behaves_like 'a match with first player serving'
        end

        context 'second' do
          before do
            subject.play_match! :win_game, opponent: winner
            subject.play_match! :start_game, player: subject.second_team.first_player
          end

          it_behaves_like 'a match with third player serving'

          context 'third' do
            before do
              subject.play_match! :win_game, opponent: winner
              subject.play_match! :start_game
            end

            it_behaves_like 'a match with second player serving'

            context 'fourth' do
              before {
                subject.play_match! :win_game, opponent: winner
                subject.play_match! :start_game
              }

              it_behaves_like 'a match with fourth player serving'

              context 'fifth' do
                before do
                  subject.play_match! :win_game, opponent: winner
                  subject.play_match! :start_game
                end

                it_behaves_like 'a match with first player serving'
              end
            end
          end
        end
      end
    end
  end

  describe 'players serving second set' do
    context 'odd number of games' do
      context 'singles' do
        subject do
          FactoryGirl.build(:play_singles_match, scoring: :three_six_game,
                            scores: [[6, 3]], start_set_game: true)
        end

        it_behaves_like 'a match with second player serving'
      end
      context 'doubles' do
        subject do
          FactoryGirl.build(:play_doubles_match, scoring: :three_six_game,
                            scores: [[6, 3]], start_set_game: true)
        end

        it_behaves_like 'a match with third player serving'
      end

    end
    context 'even number of games' do
      context 'singles' do
        subject do
          FactoryGirl.build(:play_singles_match, scoring: :three_six_game,
                            scores: [[7, 5]], start_set_game: true)
        end

        it_behaves_like 'a match with first player serving'
      end

      context 'doubles' do
        subject do
          FactoryGirl.build(:play_doubles_match, scoring: :three_six_game,
                            scores: [[6, 4]], start_set_game: true)
        end

        it_behaves_like 'a match with second player serving'
      end
    end

    context 'tiebreaker' do
      context 'singles' do
        subject do
          FactoryGirl.build(:play_singles_match, scoring: :three_six_game,
                            scores: [[6, 7]], start_set_game: true)
        end

        it_behaves_like 'a match with first player serving'
      end

      context 'doubles' do
        subject do
          FactoryGirl.build(:play_doubles_match, scoring: :three_six_game,
                            scores: [[7, 6]], start_set_game: true)
        end

        it_behaves_like 'a match with first player serving'
      end
    end
  end

  describe 'match scoring' do
    describe :one_eight_game do
      subject do
        FactoryGirl.build(:play_singles_match, scoring: :one_eight_game,
                          scores: [[8, 9]])
      end
      it_behaves_like 'a match with one set'
      it_behaves_like 'a match with eight game sets'
    end

    describe :two_six_game_ten_point do
      subject do
        FactoryGirl.build(:play_singles_match, scoring: :two_six_game_ten_point,
                          scores: [[6, 3], [3, 6], [0, 1]])
      end
      it_behaves_like 'a match with two sets'
      it_behaves_like 'a match with match tiebreaker'
      it_behaves_like 'a match with six game sets'
    end

    describe :three_six_game do
      subject do
        FactoryGirl.build(:play_singles_match, scoring: :three_six_game,
                          scores: [[6, 3], [3, 6], [7, 6]])
      end
      it_behaves_like 'a match with three sets'
      it_behaves_like 'a match with six game sets'
    end
  end

  describe 'match version' do

    context 'initial value' do
      subject { FactoryGirl.create(:play_singles_match) }

      it 'should have nil version initially' do
        expect(subject.play_version).to be_nil
      end
    end

    context 'after match started' do
      subject { FactoryGirl.build(:play_singles_match, start_play: true) }

      it 'should have number' do
        expect(subject.play_version).not_to be_nil
      end

      context 'when use valid version' do
        before { subject.play_match! :start_game, { player: subject.first_player, version: subject.play_version } }

        it_behaves_like 'a match with game in progress'
      end

      it 'should raise exception when version is behind' do
        expect do
          subject.play_match! :start_game, { player: subject.first_player, version: subject.play_version - 1 }
        end.to raise_error Exceptions::InvalidOperation
      end

      it 'should raise exception when version is ahead' do
        expect do
          subject.play_match! :start_game, { player: subject.first_player, version: subject.play_version + 1 }
        end.to raise_error Exceptions::InvalidOperation
      end

    end

  end
end

