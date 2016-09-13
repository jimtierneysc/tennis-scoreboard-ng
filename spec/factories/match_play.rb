require 'match_player'
# Create matches in progress
FactoryGirl.define do
  factory :play_singles_match, class: Match, parent: :singles_match do
    transient do
      scores []
      start_play false
      start_first_game false
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
      start_set_game false
    end

    after(:build) do |subject, factory|
      after_build(subject, factory)
    end
  end
end

def after_build(subject, factory)
  if factory.start_play
    MatchPlayer.new(subject).start_play
  end
  if factory.start_first_game
    MatchPlayer.new(subject).start_first_game
  end
  if factory.scores.count > 0
    scores = MatchPlayer.convert_scores(factory.scores)
    MatchPlayer.play(subject, scores)
  end
  if factory.start_set_game
    MatchPlayer.new(subject).start_set_game
  end
end


