require 'rails_helper'

# Matches and shared examples for match_play specs

module MatchPlayShared

  RSpec::Matchers.define :allow_action do |action|
    match do |m|
      m.play_match?(action)
    end

    failure_message do
      "expect to allow action :#{action}"
    end

    failure_message_when_negated do
      "expect to not allow action :#{action}"
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

  RSpec::Matchers.define :allow_win_game do
    match do |m|
      m.play_match?(:win_game) || m.play_match?(:win_tiebreaker)
    end

    failure_message do
      'expect to allow win_game or win_tiebreaker actions'
    end

    failure_message_when_negated do
      'do not expect to allow win_game or win_tiebreaker actions'
    end
  end

  RSpec::Matchers.define :have_game_count do |count|
    match do |m|
      m.match_sets.count == 1 && m.match_sets[0].set_games.count == count
    end

    failure_message do
      "expect to have #{count} games"
    end

    failure_message_when_negated do
      "do not expect to have #{count} games"
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

    failure_message do
      "expect to have #{size} games, but have #{@actual}"
    end

    failure_message_when_negated do
      "do not expect to have #{size} games"
    end
  end

  RSpec::Matchers.define :have_set_count do |count|
    match do |m|
      @actual = m.match_sets.reject(&:tiebreaker?).count
      @actual == count
    end

    failure_message do
      "expect to have #{count} sets, but have #{@actual}"
    end

    failure_message_when_negated do
      "do not expect to have #{count} sets"
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

  RSpec::Matchers.define :be_serving do |player_ordinal|
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
    it 'game started' do
      is_expected.not_to allow_win_game
    end
  end

  RSpec.shared_examples 'a match not started' do
    it 'does not have changes' do
      is_expected.not_to have_changes
    end
  end

  RSpec.shared_examples 'a match just started' do
    it_behaves_like 'a game not started'
    it_behaves_like 'a match set in progress'
  end

  RSpec.shared_examples 'a match set in progress' do
    it 'has last set in progress' do
      is_expected.to have_last_set_in_progress
    end
  end

  RSpec.shared_examples 'a match with game in progress' do
    it 'have game in progress' do
      is_expected.to have_game_in_progress
    end
  end

  RSpec.shared_examples 'a match with one game' do
    it 'has one game' do
      is_expected.to have_game_count(1)
    end
  end

  RSpec.shared_examples 'a match with two games' do
    it 'has two games' do
      is_expected.to have_game_count(2)
    end
  end

  RSpec.shared_examples 'a match with game won' do
    it 'does have winner' do
      is_expected.to have_game_with_winner
    end
  end

  RSpec.shared_examples 'a match can start set tiebreaker' do
    it 'can start set tiebreaker' do
      is_expected.to allow_action :start_tiebreaker
    end
  end

  RSpec.shared_examples 'a match in set tiebreaker' do
    it 'can win set tiebreaker' do
      is_expected.to allow_action :win_tiebreaker
    end
  end

  RSpec.shared_examples 'a match with finished set' do
    it 'has finished set' do
      is_expected.to have_finished_set
    end
  end

  RSpec.shared_examples 'a match can start match tiebreaker' do
    it 'can start set tiebreaker' do
      is_expected.to allow_action :start_match_tiebreaker
    end
  end

  RSpec.shared_examples 'a match in match tiebreaker' do
    it 'can win set tiebreaker' do
      is_expected.to allow_action :win_match_tiebreaker
    end
  end

  RSpec.shared_examples 'a match finished' do
    it 'is finished' do
      is_expected.to be_finished
    end
  end

  RSpec.shared_examples 'a match set can be completed' do
    it 'can complete set' do
      is_expected.to allow_action :complete_set_play
    end
  end

  RSpec.shared_examples 'a match with complete set' do
    it 'has completed set' do
      is_expected.to have_complete_set
    end
  end

  RSpec.shared_examples 'a match can be completed' do
    it 'can be completed' do
      is_expected.to allow_action :complete_play
    end
  end

  RSpec.shared_examples 'a match complete' do
    it 'is completed' do
      is_expected.to be_complete
    end
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
    it 'serving' do
      is_expected.to be_serving(0)
    end
  end

  RSpec.shared_examples 'a match with second player serving' do
    it 'serving' do
      is_expected.to be_serving(1)
    end
  end

  RSpec.shared_examples 'a match with third player serving' do
    it 'serving' do
      is_expected.to be_serving(2)
    end
  end

  RSpec.shared_examples 'a match with fourth player serving' do
    it 'serving' do
      is_expected.to be_serving(3)
    end
  end

  RSpec.shared_examples 'a match with three sets' do
    it 'set count' do
      is_expected.to have_set_count(3)
    end
  end

  RSpec.shared_examples 'a match with two sets' do
    it 'set count' do
      is_expected.to have_set_count(2)
    end
  end

  RSpec.shared_examples 'a match with match tiebreaker' do
    it 'set count' do
      is_expected.to have_match_tiebreaker
    end
  end

  RSpec.shared_examples 'a match with one set' do
    it 'set count' do
      is_expected.to have_set_count(1)
    end
  end

  RSpec.shared_examples 'a match with six game sets' do
    it 'set size' do
      is_expected.to have_set_size(6)
    end
  end

  RSpec.shared_examples 'a match with eight game sets' do
    it 'set size' do
      is_expected.to have_set_size(8)
    end
  end
end

RSpec.configure do |c|
  c.extend MatchPlayShared, match_play_shared: true
end



