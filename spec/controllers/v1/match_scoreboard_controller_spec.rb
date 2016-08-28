require 'rails_helper'
require 'controllers/controllers_shared'

RSpec.describe V1::MatchScoreboardController, { type: :controller } do

  let(:new_user) { FactoryGirl.create :user }
  let(:doubles_match) { FactoryGirl.create :doubles_match }
  let(:singles_match) { FactoryGirl.create :singles_match }
  let(:not_found_match_id) { doubles_match.id + singles_match.id }
  let(:match_title) { doubles_match.title + 'a' }

  describe 'GET #show' do
    context 'when doubles' do
      before { get :show, id: doubles_match.id }

      it_behaves_like 'doubles match scoreboard response'
    end

    context 'when singles' do
      before { get :show, id: singles_match.id }

      it_behaves_like 'singles match scoreboard response'
    end

    context 'when does not exist' do
      before { get :show, id: not_found_match_id }

      it_behaves_like 'not found'
    end
  end

  describe 'PUT/PATCH #update' do
    def post_action(id, action, param = nil)
      params = { action: action }
      params.merge!(param) if param
      post :update, id: id, match_scoreboard: params
    end

    context 'when authorized' do
      before { api_authorization_header new_user.auth_token }

      context('when is started') do
        before { post_action doubles_match.id, :start_play }

        it_behaves_like 'doubles match scoreboard response'
        it_behaves_like 'accepted action'
      end

      context 'when action is unknown' do

        describe 'unknown name' do
          before { post_action doubles_match.id, :xxx }

          it_behaves_like 'general error', 'Unknown action: xxx'
        end

        describe 'requires a parameter' do
          before { post_action doubles_match.id, :win_game }

          it_behaves_like 'general error', "Unknown team for action: #{:win_game}"
        end
      end

      context 'when is denied' do
        before { post_action doubles_match.id, :start_tiebreak }

        it_behaves_like 'denied action'
      end

      context 'when does not exists' do
        before { post_action not_found_match_id, :start_play }

        it_behaves_like 'not found'
      end

      context 'when pass parameter' do
        describe 'to start game' do
          let(:match) { FactoryGirl.build :play_singles_match, start_play: true }
          before do
            # identify first server
            post_action match.id, :start_game, { player: match.first_player.id, version: match.play_version }
          end
          it_behaves_like 'singles match scoreboard response'
          it_behaves_like 'accepted action'
        end

        describe 'to win' do
          context 'doubles' do
            let(:match) { FactoryGirl.build :play_doubles_match, start_first_game: true }
            before do
              # identify winning team
              post_action match.id, :win_game, { team: match.first_team.id }
            end
            it_behaves_like 'doubles match scoreboard response'
            it_behaves_like 'accepted action'
          end
        end

        context 'singles' do
          let(:match) { FactoryGirl.build :play_singles_match, start_first_game: true }
          before do
            # identify winning player
            post_action match.id, :win_game, { player: match.first_player.id }
          end
          it_behaves_like 'singles match scoreboard response'
          it_behaves_like 'accepted action'
        end
      end

      context 'when pass scoreboard version' do
        let(:match) { FactoryGirl.build :play_singles_match, start_play: true }

        describe 'that is behind' do
          before do
            post_action match.id, :start_game, { player: match.first_player.id, version: match.play_version - 1 }
          end
          it_behaves_like 'denied action'
        end

        describe 'that is ahead' do
          before do
            post_action match.id, :start_game, { player: match.first_player.id, version: match.play_version + 1 }
          end
          it_behaves_like 'denied action'
        end

        describe 'that is correct' do
          before do
            post_action match.id, :start_game, { player: match.first_player.id, version: match.play_version }
          end
          it_behaves_like 'singles match scoreboard response'
          it_behaves_like 'accepted action'
        end

      end
    end

    context('when not authorized') do
      before { post_action 1, :start_play }

      it_behaves_like 'login required'
    end
  end
end
