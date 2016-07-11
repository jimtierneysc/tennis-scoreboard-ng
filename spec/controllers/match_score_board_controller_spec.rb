require 'rails_helper'
require 'controllers/controllers_shared'

RSpec.describe MatchScoreBoardController, type: :controller do

  let(:new_user) { FactoryGirl.create :user }
  let(:doubles_match) { FactoryGirl.create :doubles_match }
  let(:singles_match) { FactoryGirl.create :singles_match }
  let(:not_found_match_id) { doubles_match.id + singles_match.id }
  let(:match_title) { doubles_match.title + 'a' }
  all_actions =
    [
      :start_play,
      :restart_play,
      :discard_play,
      :complete_play,
      :start_next_set,
      :complete_set_play,
      :start_next_game,
      :start_tiebreaker,
      :remove_last_change,
      :start_match_tiebreaker,
      :complete_match_tiebreaker,
      :win_game,
      :win_tiebreaker,
      :win_match_tiebreaker
    ]

  first_actions =
    [
      :start_play,
      :restart_play,
      :discard_play
    ]

  win_actions =
    [
      :win_game,
      :win_tiebreaker,
      :win_match_tiebreaker
    ]

  describe "GET #show" do
    context "when doubles matches exists" do
      before(:each) do
        get :show, id: doubles_match.id
      end

      it_behaves_like "doubles match scoreboard response"

      it { is_expected.to respond_with 200 }
    end

    context "when singles matches exists" do
      before(:each) do
        get :show, id: singles_match.id
      end

      it_behaves_like "singles match scoreboard response"

      it { is_expected.to respond_with 200 }
    end

    context "when does not exists" do
      before(:each) do
        get :show, id: not_found_match_id
      end

      it_behaves_like "not found"
    end
  end


  describe "PUT/PATCH #update" do
    def post_action(id, action, winner_id = nil)
      params = { action: action }
      params[:team] = winner_id if winner_id
      post :update, id: id, match_score_board: params
    end

    context "when authorized" do
      before(:each) do
        api_authorization_header new_user.auth_token
      end

      context "when is started" do
        before(:each) do
          post_action doubles_match.id, :start_play
        end

        it_behaves_like "doubles match scoreboard response"

        it { is_expected.to respond_with 200 }
      end

      describe "unknown actions" do

        context "when unknown action name" do
          before(:each) do
            post_action doubles_match.id, :xxx
          end

          it_behaves_like "general error", 'Unknown action: xxx'
        end

        describe "actions that require a parameter" do

          win_actions.each do |action|
            context "when #{action}" do
              before(:each) do
                post_action doubles_match.id, action
              end

              it_behaves_like "general error", "Unknown action: #{action}"
            end
          end
        end
      end


      describe 'match has not started' do

        context 'when action is accepted' do
          first_actions.each do |action|

            context "when #{action}" do
              before(:each) do
                post_action doubles_match.id, action
              end

              it_behaves_like "accepted action"

            end
          end
        end

        context 'when action is denied' do
          all_actions.reject { | a | first_actions.include?(a) or win_actions.include?(a)}.each do |action|

            context "when #{action}" do
              before(:each) do
                post_action doubles_match.id, action
              end

              it_behaves_like "denied action"

            end
          end
        end
      end

      context "when does not exists" do
        before(:each) do
          post_action not_found_match_id, :start_play
        end

        it_behaves_like "not found"
      end
    end

    context "when not authorized" do
      before(:each) do
        post_action 1, :start_play
      end

      it_behaves_like "login required"
    end

  end


end
