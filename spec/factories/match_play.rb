require 'play_match'
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
    PlayMatch.new(subject).start_play
  end
  if factory.start_first_game
    PlayMatch.new(subject).start_first_game
  end
  if factory.scores.count > 0
    scores = PlayMatch.convert_scores(factory.scores)
    PlayMatch.play_match(subject, scores, { complete_set: factory.complete_set,
                                                       complete_match: factory.complete_match
    })
  end
  if factory.start_set_game
    PlayMatch.new(subject).start_set_game

  end
end


