require 'rails_helper'
require 'controllers/controllers_shared'
require 'support/play_actions'

RSpec.describe MatchScoreBoardController, { type: :controller, play_actions: true } do

  let(:new_user) { FactoryGirl.create :user }
  let(:doubles_match) { FactoryGirl.create :doubles_match }
  let(:singles_match) { FactoryGirl.create :singles_match }
  let(:not_found_match_id) { doubles_match.id + singles_match.id }
  let(:match_title) { doubles_match.title + 'a' }

  describe 'GET #show' do
    context 'when doubles matches exists' do
      before(:each) do
        get :show, id: doubles_match.id
      end

      it_behaves_like 'doubles match scoreboard response'

      it { is_expected.to respond_with 200 }
    end

    context 'when singles matches exists' do
      before(:each) do
        get :show, id: singles_match.id
      end

      it_behaves_like 'singles match scoreboard response'

      it { is_expected.to respond_with 200 }
    end

    context 'when does not exists' do
      before(:each) do
        get :show, id: not_found_match_id
      end

      it_behaves_like 'not found'
    end
  end

  describe 'PUT/PATCH #update' do
    def post_action(id, action, param = nil)
      params = { action: action }
      params.merge!(param) if param
      post :update, id: id, match_score_board: params
    end

    context 'when authorized' do
      before do
        api_authorization_header new_user.auth_token
      end

      context 'when is started' do
        before do
          post_action doubles_match.id, :start_play
        end

        it_behaves_like 'doubles match scoreboard response'

        it_behaves_like 'accepted action'

        it { is_expected.to respond_with 200 }
      end

      describe 'action is unknown' do

        describe 'unknown action name' do
          before do
            post_action doubles_match.id, :xxx
          end

          it_behaves_like 'general error', 'Unknown action: xxx'
        end

        describe 'action that require a parameter' do
          before do
            post_action doubles_match.id, :win_game
          end

          it_behaves_like 'general error', "Unknown action: #{:win_game}"
        end
      end

      describe 'match action is denied' do
        before do
          post_action doubles_match.id, :start_tiebreaker
        end

        it_behaves_like 'denied action'
      end

      context 'when does not exists' do
        before do
          post_action not_found_match_id, :start_play
        end

        it_behaves_like 'not found'
      end

      context 'when pass parameter' do
        context 'player parameter' do
          let(:match) { FactoryGirl.build :play_singles_match, start_play: true }
          before do
            # identify first server
            post_action match.id, :start_game, { player: match.first_player.id }
          end
          it_behaves_like 'singles match scoreboard response'
          it_behaves_like 'accepted action'

          it { is_expected.to respond_with 200 }
        end

        context 'team parameter' do
          let(:match) { FactoryGirl.build :play_doubles_match, start_first_game: true }
          before do
            # identify winning team
            post_action match.id, :win_game, { team: match.first_team.id }
          end
          it_behaves_like 'doubles match scoreboard response'
          it_behaves_like 'accepted action'

          it { is_expected.to respond_with 200 }
        end
      end
    end

    context 'when not authorized' do
      before do
        post_action 1, :start_play
      end

      it_behaves_like 'login required'
    end
  end
end
