# Read about factories at https://github.com/thoughtbot/factory_girl

FactoryGirl.define do

  factory :set_game, class: SetGame do
    transient do
      match_title 'match'
    end

    ordinal 1
    match_set_id do
      match = Match.find_by(title: match_title) || FactoryGirl.create(:singles_match, match_title: match_title)
      set = match.match_sets.find_by(ordinal: 1) || FactoryGirl.create(:match_set, match_title: match_title)
      set.id
    end
  end

end

