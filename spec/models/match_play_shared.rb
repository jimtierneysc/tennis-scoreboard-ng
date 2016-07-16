require 'rails_helper'

# Matches and shared examples for match_play specs

module MatchPlayShared

  RSpec::Matchers.define :permit_action do |action|
    match do |m|
      m.play_match?(action)
    end

    description do
      "permit #{action} action"
    end

    failure_message do
      "expect to permit action #{action}"
    end

    failure_message_when_negated do
      "expect to not permit action #{action}"
    end
  end

  RSpec::Matchers.define :have_last_set_in_progress do
    match do |m|
      m.last_set.team_winner.nil? if m.last_set
    end

    failure_message do
      'expect match to have set in progress'
    end

    failure_message_when_negated do
      'do not expect match to have set in progress'
    end
  end

  RSpec::Matchers.define :be_finished do
    match do |m|
      m.state == :finished
    end

    failure_message do
      'expect to be finished'
    end

    failure_message_when_negated do
      'do not expect to be finished'
    end
  end

  RSpec::Matchers.define :be_complete do
    match do |m|
      m.state == :complete
    end

    failure_message do
      'expect to be complete'
    end

    failure_message_when_negated do
      'do not expect to be complete'
    end
  end

  RSpec::Matchers.define :permit_win_game do
    match do |m|
      m.play_match?(:win_game) || m.play_match?(:win_tiebreaker)
    end

    description do
      'permit win_game or win_tiebreaker actions'
    end

    failure_message do
      'expect to permit win_game or win_tiebreaker actions'
    end

    failure_message_when_negated do
      'do not expect to permit win_game or win_tiebreaker actions'
    end
  end

  RSpec::Matchers.define :have_game_count do |count|
    match do |m|
      m.match_sets.count == 1 && m.match_sets[0].set_games.count == count
    end

    description do
      "have set with #{count} #{count > 1 ? 'games' : 'game'}"
    end

    failure_message do
      "expect to have set with #{count} game(s)"
    end

    failure_message_when_negated do
      "do not expect to set with have #{count} games(s)"
    end
  end

  RSpec::Matchers.define :have_set_size do |size|
    match do |m|
      @actual = nil
      sets = m.match_sets.reject(&:tiebreaker?)
      sets.each do |set|
        unless size == set.win_threshold
          @actual = set.win_threshold
        end
      end
      sets.empty? || @actual ? false : true
    end

    description do
      "have #{size} game set"
    end

    failure_message do
      "expect to have #{size} game set, but have #{@actual} game set"
    end

    failure_message_when_negated do
      "do not expect to have #{size} game set"
    end
  end

  RSpec::Matchers.define :have_set_count do |count|
    match do |m|
      @actual = m.match_sets.reject(&:tiebreaker?).count
      @actual == count
    end

    description do
      "have #{count} #{count > 1 ? 'sets' : 'set'}"
    end

    failure_message do
      "expect to have #{count} set(s), but have #{@actual}"
    end

    failure_message_when_negated do
      "do not expect to have #{count} set(s)"
    end
  end

  RSpec::Matchers.define :have_match_tiebreaker do
    match do |m|
      m.last_set.tiebreaker?
    end

    failure_message do
      'expect to have match tiebreaker'
    end

    failure_message_when_negated do
      'do not expect to have match tiebreaker'
    end
  end

  RSpec::Matchers.define :have_changes do
    match do |m|
      actions = [:restart_play, :discard_play, :remove_last_change]
      actions.each do |action|
        return false if not m.play_match? action
      end
      return true
    end

    failure_message do
      'expect to have changes'
    end

    failure_message_when_negated do
      'do not expect to have changes'
    end
  end

  RSpec::Matchers.define :have_complete_set do
    match do |m|
      last_set = m.last_set
      return last_set && last_set.state == :complete
    end

    failure_message do
      'expect to have complete set'
    end

    failure_message_when_negated do
      'do not expect to have complete set'
    end
  end

  RSpec::Matchers.define :have_finished_set do
    match do |m|
      last_set = m.last_set
      return last_set && last_set.state == :finished
    end

    failure_message do
      'expect to have finished set'
    end

    failure_message_when_negated do
      'do not expect to have finished set'
    end
  end

  RSpec::Matchers.define :have_game_in_progress do
    match do |m|
      last_game = m.last_set.last_game if m.last_set
      last_game.team_winner.nil? && last_game.player_server if last_game
    end

    failure_message do
      'expect to have game in progress'
    end

    failure_message_when_negated do
      'do not expect to have game in progress'
    end
  end

  RSpec::Matchers.define :have_game_with_winner do
    match do |m|
      last_game = m.last_set.last_game if m.last_set
      last_game.team_winner if last_game
    end

    failure_message do
      'expect to have game with server'
    end

    failure_message_when_negated do
      'do not expect to have game with server'
    end
  end

  RSpec::Matchers.define :be_serving do |player_ordinal, doubles|
    match do |m|
      @expected = nil
      @actual = nil
      @last_game = m.last_set.last_game if m.last_set
      if @last_game && @last_game.team_winner.nil?
        players = [
          m.doubles ? m.first_team.first_player : m.first_player,
          m.doubles ? m.first_team.second_player : m.second_player,
          m.doubles ? m.second_team.first_player : nil,
          m.doubles ? m.second_team.second_player : nil
        ]
        @expected = players[player_ordinal]
        @actual = @last_game.player_server
        @actual && @actual == @expected
      else
        false
      end
    end

    description do
      player = case player_ordinal
               when 0
                 doubles ? 'first_team.first_player' : 'first_player'
               when 1
                 doubles ? 'first_team.second_player' : 'second_player'
               when 2
                 'second_team.first_player'
               when 3
                 'second_team.second_player'
               end
      "#{player} be serving"
    end

    failure_message do
      if @actual && @expected
        "expected #{@expected.name} to be serving, but #{@actual.name} is serving"
      elsif @last_game.nil?
        'expected game in progress'
      else
        'expected server'
      end
    end

    failure_message_when_negated do
      if @actual
        "Did not expect #{@actual.name} to be serving"
      else
        'Did not expect server'
      end
    end
  end

  RSpec.shared_examples 'a game not started' do
    it { is_expected.not_to permit_win_game }
  end

  RSpec.shared_examples 'a match not started' do
    it { is_expected.not_to have_changes }
  end

  RSpec.shared_examples 'a match just started' do
    it_behaves_like 'a game not started'
    it_behaves_like 'a match set in progress'
  end

  RSpec.shared_examples 'a match set in progress' do
    it { is_expected.to have_last_set_in_progress }
  end

  RSpec.shared_examples 'a match with game in progress' do
    it { is_expected.to have_game_in_progress }
  end

  RSpec.shared_examples 'a match with one game' do
    it { is_expected.to have_game_count(1) }
  end

  RSpec.shared_examples 'a match with two games' do
    it { is_expected.to have_game_count(2) }
  end

  RSpec.shared_examples 'a match with game won' do
    it { is_expected.to have_game_with_winner }
  end

  RSpec.shared_examples 'a match can start set tiebreaker' do
    it { is_expected.to permit_action :start_tiebreaker }
  end

  RSpec.shared_examples 'a match in set tiebreaker' do
    it { is_expected.to permit_action :win_tiebreaker }
  end

  RSpec.shared_examples 'a match with finished set' do
    it { is_expected.to have_finished_set }
  end

  RSpec.shared_examples 'a match can start match tiebreaker' do
    it { is_expected.to permit_action :start_match_tiebreaker }
  end

  RSpec.shared_examples 'a match in match tiebreaker' do
    it { is_expected.to permit_action :win_match_tiebreaker }
  end

  RSpec.shared_examples 'a match finished' do
    it { is_expected.to be_finished }
  end

  RSpec.shared_examples 'a match set can be completed' do
    it { is_expected.to permit_action :complete_set_play }
  end

  RSpec.shared_examples 'a match with complete set' do
    it { is_expected.to have_complete_set }
  end

  RSpec.shared_examples 'a match can be completed' do
    it { is_expected.to permit_action :complete_play }
  end

  RSpec.shared_examples 'a match complete' do
    it { is_expected.to be_complete }
  end

  RSpec.shared_examples 'a match with first game started' do
    it_behaves_like 'a match with game in progress'
    it_behaves_like 'a match with one game'
  end

  RSpec.shared_examples 'a match with second game started' do
    it_behaves_like 'a match with game in progress'
    it_behaves_like 'a match with two games'
  end

  RSpec.shared_examples 'a match with first player serving' do
    it { is_expected.to be_serving(0, subject.doubles) }
  end

  RSpec.shared_examples 'a match with second player serving' do
    it { is_expected.to be_serving(1, subject.doubles) }
  end

  RSpec.shared_examples 'a match with third player serving' do
    it { is_expected.to be_serving(2, subject.doubles) }
  end

  RSpec.shared_examples 'a match with fourth player serving' do
    it { is_expected.to be_serving(3, subject.doubles) }
  end

  RSpec.shared_examples 'a match with three sets' do
    it { is_expected.to have_set_count(3) }
  end

  RSpec.shared_examples 'a match with two sets' do
    it { is_expected.to have_set_count(2) }
  end

  RSpec.shared_examples 'a match with match tiebreaker' do
    it { is_expected.to have_match_tiebreaker }
  end

  RSpec.shared_examples 'a match with one set' do
    it { is_expected.to have_set_count(1) }
  end

  RSpec.shared_examples 'a match with six game sets' do
    it { is_expected.to have_set_size(6) }
  end

  RSpec.shared_examples 'a match with eight game sets' do
    it { is_expected.to have_set_size(8) }
  end

  def all_actions
    [
      :start_play,
      :restart_play,
      :discard_play,
      :complete_play,
      :start_set,
      :complete_set_play,
      :start_game,
      :start_tiebreaker,
      :remove_last_change,
      :start_match_tiebreaker,
      :complete_match_tiebreaker,
      :win_game,
      :win_tiebreaker,
      :win_match_tiebreaker
    ]
  end

  def first_actions
    [
      :start_play,
    ]
  end

  def win_actions
    [
      :win_game,
      :win_tiebreaker,
      :win_match_tiebreaker
    ]
  end

end

RSpec.configure do |c|
  c.extend MatchPlayShared, match_play_shared: true
end



