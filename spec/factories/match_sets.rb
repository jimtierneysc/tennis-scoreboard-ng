# == Schema Information
#
# Table name: match_sets
#
#  id             :integer          not null, primary key
#  match_id       :integer          not null
#  ordinal        :integer          not null
#  created_at     :datetime         not null
#  updated_at     :datetime         not null
#  scoring        :string           not null
#  team_winner_id :integer
#

FactoryGirl.define do

  factory :match_set, class: MatchSet do
    transient do
      match_title 'factory match'
    end

    ordinal 1
    scoring 'six_game'
    match_id do
      (Match.find_by(title: match_title) || FactoryGirl.create(:singles_match, title: match_title)).id
    end
  end

end

