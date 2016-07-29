# Create matches in progress
FactoryGirl.define do
  factory :play_singles_match, class: Match, parent: :singles_match do
    transient do
      scores []
      start_play false
      start_first_game false
      complete_set true
      complete_match true
      start_set_game false
    end

    after(:build) do |subject, factory|
      after_build(subject, factory)
    end
  end

  factory :play_doubles_match, class: Match, parent: :doubles_match do
    transient do
      scores []
      start_play false
      start_first_game false
      complete_set true
      complete_match true
      start_set_game false
    end

    after(:build) do |subject, factory|
      after_build(subject, factory)
    end
  end
end

def after_build(subject, factory)
  if factory.start_play
    MatchPlayHelper.new(subject).start_play!
  end
  if factory.start_first_game
    MatchPlayHelper.new(subject).start_first_game!
  end
  if factory.scores.count > 0
    MatchPlayHelper.new(subject).score!(factory.scores, factory.complete_set, factory.complete_match)
  end
  if factory.start_set_game
    MatchPlayHelper.new(subject).start_set_game!
  end
end


class MatchPlayHelper
  def initialize(match)
    @subject = match
  end

  attr_reader :subject

  def start_play!
    subject.save!
    if subject.play_match? :start_play
      subject.play_match! :start_play
    end
  end

  def start_first_game!
    start_play!
    if subject.play_match?(:start_game) && no_games?
      if subject.doubles
        subject.play_match! :start_game, player: subject.first_team.first_player
      else
        subject.play_match! :start_game, player: subject.first_player
      end
    end
  end

  def score!(scores, complete_set = true, complete_match = true)
    start_play!
    (1..scores.count).each do |set|
      if set > 1
        subject.play_match! :complete_set_play
        play_match! [:start_set, :start_match_tiebreaker]
      end
      if subject.match_sets[set-1].tiebreaker?
        score_match_tiebreaker(set, scores[set-1], subject.first_team, subject.second_team)
      else
        score_set!(set, scores[set-1], subject.first_team, subject.second_team)
      end
    end
    if complete_set
      play_match! [:complete_set_play, :complete_match_tiebreaker]
    end
    if complete_match
      play_match! [:complete_play]
    end
  end

  def start_set_game!
    subject.play_match! :start_set
    subject.play_match! :start_game
  end

  private

  def score_match_tiebreaker(set, scores, first_opponent, second_opponent)
    subject.play_match! :win_match_tiebreaker,
                          opponent: (scores[0] == 1 ? first_opponent : second_opponent)
  end

  def score_set!(set, scores, first_opponent, second_opponent)
    counters = [scores[0], scores[1]]
    opponents = [first_opponent, second_opponent]
    win_threshold = subject.match_sets[set-1].win_threshold
    max_games = win_threshold * 2
    (1..max_games).each do |game|
      # alternate games to prevent match set from being won before all games are played
      i = if counters.min == 0
            (counters.rindex(0) + 1) % 2
          else
            game % 2
          end
      if counters[i] > 0
        start_game!
        subject.play_match! :win_game, opponent: opponents[i]
        counters[i] -= 1
      else
        break
      end
    end
    if counters.max == 1
      subject.play_match! :start_tiebreaker
      subject.play_match! :win_tiebreaker, opponent: opponents[counters.rindex(1)]
    end
  end

  def start_game!
    if no_games?
      start_first_game!
    elsif one_game?
      start_second_game!
    else
      subject.play_match! :start_game
    end
  end

  def no_games?
    subject.match_sets.count == 1 && subject.match_sets[0].set_games.count == 0
  end

  def one_game?
    subject.match_sets.count == 1 && subject.match_sets[0].set_games.count == 1
  end

  def start_second_game!
    if subject.doubles
      subject.play_match! :start_game, player: subject.second_team.first_player
    else
      subject.play_match! :start_game
    end
  end

  def play_match! actions
    actions.each do |action|
      if subject.play_match? action
        subject.play_match! action
        break
      end
    end
  end

end


