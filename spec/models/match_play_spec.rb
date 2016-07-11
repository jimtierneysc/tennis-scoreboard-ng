require 'rails_helper'
require 'models/match_play_shared'

# Test actions:
# :start_play - Start match
# :restart_play - Restart match
# :discard_play - Discard all scoring
# :complete_play - Complete match
# :start_next_set
# :complete_set_play
# :start_next_game
# :start_tiebreaker - Start game tiebreaker
# :remove_last_change - Undo
# :start_match_tiebreaker
# :complete_match_tiebreaker
# :win_game
# :win_tiebreaker
# :win_match_tiebreaker
# Test match scoring:
# :one_eight_game
# :two_six_game_ten_point
# :three_six_game


RSpec.describe 'Match Play', type: :model do
  describe 'empty match' do
    before {
      @match = FactoryGirl.build(:singles_match)
    }
    subject { @match }

    it_behaves_like 'match not started'
  end

  describe 'start match' do
    before {
      @match = FactoryGirl.build(:singles_match)
      @match.save!
      @match.change_score! :start_play
    }
    subject { @match }

    it_behaves_like 'match just started'

    context 'remove last change' do
      before {
        subject.change_score! :remove_last_change
      }
      it_behaves_like 'match not started'
    end

    context 'discard play' do
      before {
        subject.change_score! :discard_play
      }
      it_behaves_like 'match not started'
    end
  end

  describe 'start game' do
    context 'singles match' do
      before {
        @match = FactoryGirl.build(:singles_match)
        @match.save!
        @match.change_score! :start_play
      }
      subject { @match }

      context 'start game with first server' do
        before {
          subject.change_score! :start_next_game, subject.first_singles_player
        }

        it_behaves_like 'match with first game started'

        context 'remove last change' do
          before {
            subject.change_score! :remove_last_change
          }
          it_behaves_like 'match just started'
        end
      end

      context 'start game without server' do
        it 'does not start' do
          expect { subject.change_score! :start_next_game }.to raise_error Exceptions::InvalidOperation
        end
      end

      context 'restart play' do
        before {
          subject.change_score! :restart_play
        }
        it_behaves_like 'match just started'
      end
    end

    context 'doubles match' do
      before {
        @match = FactoryGirl.build(:doubles_match)
        @match.save!
        @match.change_score! :start_play
      }
      subject { @match }

      context 'start first game with first server' do
        before {
          subject.change_score! :start_next_game, subject.first_team.first_player
        }

        it_behaves_like 'match with first game started'

        context 'remove last change' do
          before {
            subject.change_score! :remove_last_change
          }
          it_behaves_like 'match just started'
        end

        context 'start second game' do
          before {
            subject.change_score! :win_game, subject.first_team
          }

          context 'start second game with second server' do
            before {
              subject.change_score! :start_next_game, subject.second_team.first_player
            }

            it_behaves_like 'match with second game started'

            context 'remove last change' do
              before {
                subject.change_score! :remove_last_change
              }
              it_behaves_like 'match with first game started'
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
    before {
      @match = FactoryGirl.build(:singles_match)
      @match.save!
      @match.change_score! :start_play
      @match.change_score! :start_next_game, @match.first_singles_player
    }
    subject { @match }

    context 'win game with player' do
      before {
        subject.change_score! :win_game, subject.first_team
      }

      it_behaves_like 'match with game won'
    end

    context 'win game without player' do
      it 'does not win' do
        expect { subject.change_score! :win_game }.to raise_error Exceptions::UnknownOperation
      end
    end
  end

  describe 'complete set' do
    before {
      @match = FactoryGirl.build(:singles_match, scoring: :three_six_game)
      @match.save!
      @match.change_score! :start_play
      @match.change_score! :start_next_game, @match.first_singles_player
      (1..6).each do |ordinal|
        @match.change_score! :start_next_game if ordinal > 1
        @match.change_score! :win_game, @match.first_team
      end
    }
    subject { @match }

    it_behaves_like 'match set can be completed'

    context 'complete play' do
      before {
        subject.change_score! :complete_set_play
      }

      it_behaves_like 'match with complete set'

      context 'remove last change' do
        before {
          subject.change_score! :remove_last_change
        }
        it_behaves_like 'match set can be completed'
      end
    end
  end

  describe 'set tiebreaker' do
    before {
      @match = FactoryGirl.build(:singles_match, scoring: :one_eight_game)
      @match.save!
      @match.change_score! :start_play
      @match.change_score! :start_next_game, @match.first_singles_player
      (1..16).each do |ordinal|
        @match.change_score! :start_next_game if ordinal > 1
        @match.change_score! :win_game, ordinal.odd? ? @match.first_team : @match.second_team
      end
    }
    subject { @match }

    it_behaves_like 'match can start set tiebreaker'

    context 'start tiebreaker' do
      before {
        subject.change_score! :start_tiebreaker
      }

      it_behaves_like 'match in set tiebreaker'

      context 'win tiebreaker with player' do
        before {
          subject.change_score! :win_tiebreaker, subject.first_team
        }

        it_behaves_like 'match with finished set'

        context 'remove last change' do
          before {
            subject.change_score! :remove_last_change
          }
          it_behaves_like 'match in set tiebreaker'
        end
      end

      context 'win tiebreaker without player' do
        it 'does not win' do
          expect { subject.change_score! :win_tiebreaker }.to raise_error Exceptions::UnknownOperation
        end
      end

      context 'remove last change' do
        before {
          subject.change_score! :remove_last_change
        }
        it_behaves_like 'match can start set tiebreaker'
      end
    end
  end

  describe 'match tiebreaker' do
    before {
      @match = FactoryGirl.build(:singles_match, scoring: :two_six_game_ten_point)
      @match.save!
      @match.change_score! :start_play
      (0..1).each do |set|
        @match.change_score! :start_next_set if set > 0
        @match.change_score! :start_next_game, (@match.first_singles_player if set == 0)
        (1..6).each do |game|
          @match.change_score! :start_next_game if game > 1
          @match.change_score! :win_game, set.odd? ? @match.first_team : @match.second_team
        end
        @match.change_score! :complete_set_play
      end
    }
    subject { @match }

    it_behaves_like 'match can start match tiebreaker'

    context 'start match tiebreaker' do
      before {
        subject.change_score! :start_match_tiebreaker
      }

      it_behaves_like 'match in match tiebreaker'

      context 'win match tiebreaker with player' do
        before {
          subject.change_score! :win_match_tiebreaker, subject.first_team
        }

        it_behaves_like 'match finished'

        context 'remove last change' do
          before {
            subject.change_score! :remove_last_change
          }
          it_behaves_like 'match in match tiebreaker'
        end
      end

      context 'win match tiebreaker without player' do
        it 'does not win' do
          expect { subject.change_score! :win_match_tiebreaker }.to raise_error Exceptions::UnknownOperation
        end
      end

      context 'remove last change' do
        before {
          subject.change_score! :remove_last_change
          subject.reload # clears destroyed entities
        }
        it_behaves_like 'match can start match tiebreaker'
      end
    end
  end

  describe 'complete match' do
    context 'multiple set match' do
      before {
        @match = FactoryGirl.build(:singles_match, scoring: :three_six_game)
        @match.save!
        @match.change_score! :start_play
        @match.change_score! :start_next_game, @match.first_singles_player
        (1..2).each do |set|
          (1..6).each do |game|
            @match.change_score! :start_next_game if set > 1 || game > 1
            @match.change_score! :win_game, @match.first_team
          end
          @match.change_score! :complete_set_play
          @match.change_score! :start_next_set if set == 1
        end
      }
      subject { @match }

      it_behaves_like 'match can be completed'

      context 'complete play' do
        before {
          subject.change_score! :complete_play
        }

        it_behaves_like 'match complete'

        context 'remove last change' do
          before {
            subject.change_score! :remove_last_change
          }
          it_behaves_like 'match can be completed'
        end
      end
    end

    context 'one set match' do
      before {
        @match = FactoryGirl.build(:singles_match, scoring: :one_eight_game)
        @match.save!
        @match.change_score! :start_play
        @match.change_score! :start_next_game, @match.first_singles_player
        (1..8).each do |ordinal|
          @match.change_score! :start_next_game if ordinal > 1
          @match.change_score! :win_game, @match.first_team
        end
        # when only one set, no need to complete_set_play
        # @match.change_score! :complete_set_play
      }
      subject { @match }

      it_behaves_like 'match can be completed'

      context 'complete play' do
        before {
          subject.change_score! :complete_play
        }

        it_behaves_like 'match complete'

        context 'remove last change' do
          before {
            subject.change_score! :remove_last_change
          }
          it_behaves_like 'match can be completed'
        end
      end
    end
  end
end
