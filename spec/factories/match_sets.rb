FactoryGirl.define do

  factory :match_set, class: MatchSet do
    transient do
      match_title 'match'
    end

    ordinal 1
    scoring 'six_game'
    match_id do
      (Match.find_by(title: match_title) || FactoryGirl.create(:singles_match, title: match_title)).id
    end
  end
end

