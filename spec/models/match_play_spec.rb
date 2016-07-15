require 'rails_helper'
require 'models/match_play_shared'

# Test match scoring

RSpec.describe 'Match Play', { type: :model, match_play_shared: true, play_actions: true } do
  describe 'empty match' do
    subject { FactoryGirl.build(:singles_match) }

    it_behaves_like 'a match not started'

    it 'detects unknown action' do
      expect { subject.play_match? :xxx }.to raise_error Exceptions::UnknownOperation
    end

    it 'returns hash of valid actions' do
      expect(subject.play_actions).to eq({ start_play: true })
    end

    context 'when many action are denied' do
      actions = all_actions.reject do |a|
        first_actions.include?(a) or win_actions.include?(a)
      end
      actions.each do |action|
        context "when #{action}" do
          it 'detects denied action' do
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

    it 'can\'t start when started' do
      expect { subject.play_match! :start_play }.to raise_error Exceptions::InvalidOperation
    end

    context 'when win actions are denied' do
      # actions = all_actions.reject { |a| first_actions.include?(a) or win_actions.include?(a) }
      # actions = all_actions.reject { |a| a == :start_play }
      win_actions.each do |action|

        context "when #{action}" do
          it 'detects denied action' do
            expect { subject.play_match! action, subject.first_team }.to raise_error Exceptions::InvalidOperation
          end

        end
      end
    end
  end

  describe 'start game' do
    context 'singles match' do
      subject { FactoryGirl.build(:play_singles_match, start_play: true) }

      context 'start game with first server' do
        before do
          subject.play_match! :start_game, subject.first_player
        end

        it_behaves_like 'a match with first game started'

        context 'remove last change' do
          before { subject.play_match! :remove_last_change }
          it_behaves_like 'a match just started'
        end
      end

      context 'start game without server' do
        it 'does not start' do
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
          subject.play_match! :start_game, subject.first_team.first_player
        end

        it_behaves_like 'a match with first game started'

        context 'remove last change' do
          before { subject.play_match! :remove_last_change }
          it_behaves_like 'a match just started'
        end

        context 'start second game' do
          before { subject.play_match! :win_game, subject.first_team }

          context 'start second game with second server' do
            before do
              subject.play_match! :start_game, subject.second_team.first_player
            end

            it_behaves_like 'a match with second game started'

            context 'remove last change' do
              before {
                subject.play_match! :remove_last_change
              }
              it_behaves_like 'a match with game won'
            end
          end

          context 'start second game without server' do
            it 'does not start' do
              expect { subject.play_match! :start_game }.to raise_error Exceptions::InvalidOperation
            end
          end

          context 'start second game with invalid server' do
            it 'does not allow same server' do
              expect { subject.play_match! :start_game, subject.first_team.first_player }.to raise_error ActiveRecord::RecordInvalid
            end

            it 'does not allow server from same team' do
              expect { subject.play_match! :start_game, subject.first_team.second_player }.to raise_error ActiveRecord::RecordInvalid
            end
          end
        end
      end

      context 'start first game without server' do
        it 'does not start' do
          expect { subject.play_match! :start_game }.to raise_error Exceptions::InvalidOperation
        end
      end
    end
  end

  describe 'win game' do
    subject { FactoryGirl.build(:play_singles_match, start_first_game: true) }

    context 'win game with player' do
      before { subject.play_match! :win_game, subject.first_team }

      it_behaves_like 'a match with game won'
    end

    context 'win game without player' do
      it 'does not win' do
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
        before { subject.play_match! :win_tiebreaker, subject.first_team }

        it_behaves_like 'a match with finished set'

        context 'remove last change' do
          before { subject.play_match! :remove_last_change }
          it_behaves_like 'a match in set tiebreaker'
        end

        it 'can\'t win tiebreaker again' do
          expect {
            subject.play_match! :win_tiebreaker, subject.first_team
          }.to raise_error Exceptions::InvalidOperation
        end
      end

      context 'win tiebreaker without player' do
        it 'does not win' do
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

    context 'start match tiebreaker' do
      before { subject.play_match! :start_match_tiebreaker }

      it_behaves_like 'a match in match tiebreaker'

      context 'win match tiebreaker with player' do
        before do
          subject.play_match! :win_match_tiebreaker, subject.first_team
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

        it 'can\'t win tiebreaker again' do
          expect {
            subject.play_match! :win_match_tiebreaker, subject.first_team
          }.to raise_error Exceptions::InvalidOperation
        end
      end

      context 'win match tiebreaker without player' do
        it 'does not win' do
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

  describe 'first set servers' do
    context 'singles' do
      context 'alternate order' do # needed for complete code coverage
        let(:winner) { subject.first_player }
        subject do
          FactoryGirl.build(:play_singles_match, scoring: :three_six_game, start_play: true)
        end

        context 'first game' do
          before do
            subject.play_match! :start_game, subject.second_player
          end
          it_behaves_like 'a match with second player serving'

          context 'second game' do
            before do
              subject.play_match! :win_game, winner
              subject.play_match! :start_game
            end

            it_behaves_like 'a match with first player serving'

            context 'third game' do
              before do
                subject.play_match! :win_game, winner
                subject.play_match! :start_game
              end

              it_behaves_like 'a match with second player serving'
            end
          end
        end
      end

      context 'sequential order' do
        let(:winner) { subject.first_player }
        subject do
          FactoryGirl.build(:play_singles_match, scoring: :three_six_game, start_first_game: true)
        end

        context 'first game' do
          it_behaves_like 'a match with first player serving'
        end

        context 'second game' do
          before do
            subject.play_match! :win_game, winner
            subject.play_match! :start_game
          end

          it_behaves_like 'a match with second player serving'

          context 'third game' do
            before do
              subject.play_match! :win_game, winner
              subject.play_match! :start_game
            end

            it_behaves_like 'a match with first player serving'
          end
        end
      end

    end
    context 'doubles' do
      context 'alternate order' do # needed for complete code coverage
        let(:winner) { subject.first_team.first_player }
        subject do
          FactoryGirl.build(:play_doubles_match, scoring: :three_six_game, start_play: true)
        end

        context 'first game' do
          before do
            subject.play_match! :start_game, subject.first_team.second_player
          end
          it_behaves_like 'a match with second player serving'

          context 'second game' do
            before do
              subject.play_match! :win_game, winner
              subject.play_match! :start_game, subject.second_team.first_player
            end
            it_behaves_like 'a match with third player serving'

            context 'third game' do
              before do
                subject.play_match! :win_game, winner
                subject.play_match! :start_game
              end
              it_behaves_like 'a match with first player serving'

              context 'fourth game' do
                before do
                  subject.play_match! :win_game, winner
                  subject.play_match! :start_game
                end
                it_behaves_like 'a match with fourth player serving'

                context 'fifth game' do
                  before do
                    subject.play_match! :win_game, winner
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
        let(:winner) { subject.first_team.first_player }
        subject do
          FactoryGirl.build(:play_doubles_match, scoring: :three_six_game, start_first_game: true)
        end

        context 'first game' do
          it_behaves_like 'a match with first player serving'
        end

        context 'second game' do
          before do
            subject.play_match! :win_game, winner
            subject.play_match! :start_game, subject.second_team.first_player
          end

          it_behaves_like 'a match with third player serving'

          context 'third game' do
            before do
              subject.play_match! :win_game, winner
              subject.play_match! :start_game
            end

            it_behaves_like 'a match with second player serving'

            context 'fourth game' do
              before {
                subject.play_match! :win_game, winner
                subject.play_match! :start_game
              }

              it_behaves_like 'a match with fourth player serving'

              context 'fifth game' do
                before do
                  subject.play_match! :win_game, winner
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

  describe 'second set servers' do
    context 'odd' do
      context 'singles' do
        subject do
          FactoryGirl.build(:play_singles_match, scoring: :three_six_game,
                            scores: [[6, 3]], start_set_game: true)
        end

        context 'first game' do
          it_behaves_like 'a match with second player serving'
        end

      end
      context 'doubles' do
        subject do
          FactoryGirl.build(:play_doubles_match, scoring: :three_six_game,
                            scores: [[6, 3]], start_set_game: true)
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
                            scores: [[7, 5]], start_set_game: true)
        end

        context 'first game' do
          it_behaves_like 'a match with first player serving'
        end
      end

      context 'doubles' do
        subject do
          FactoryGirl.build(:play_doubles_match, scoring: :three_six_game,
                            scores: [[6, 4]], start_set_game: true)
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
                            scores: [[6, 7]], start_set_game: true)
        end

        context 'first game' do
          it_behaves_like 'a match with first player serving'
        end
      end

      context 'doubles' do
        subject do
          FactoryGirl.build(:play_doubles_match, scoring: :three_six_game,
                            scores: [[7, 6]], start_set_game: true)
        end

        context 'first game' do
          it_behaves_like 'a match with first player serving'
        end
      end
    end
  end

  describe 'scoring' do
    describe 'eight game' do
      subject do
        FactoryGirl.build(:play_singles_match, scoring: :one_eight_game,
                          scores: [[8, 9]])
      end
      it_behaves_like 'a match with one set'

      it_behaves_like 'a match with eight game sets'

    end

    describe 'two set' do
      subject do
        FactoryGirl.build(:play_singles_match, scoring: :two_six_game_ten_point,
                          scores: [[6, 3], [3, 6], [0, 1]])
      end
      it_behaves_like 'a match with two sets'

      it_behaves_like 'a match with match tiebreaker'

      it_behaves_like 'a match with six game sets'
    end

    describe 'three set' do
      subject do
        FactoryGirl.build(:play_singles_match, scoring: :three_six_game,
                          scores: [[6, 3], [3, 6], [7, 6]])
      end
      it_behaves_like 'a match with three sets'

      it_behaves_like 'a match with six game sets'
    end
  end
end
