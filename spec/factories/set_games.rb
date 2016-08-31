# == Schema Information
#
# Table name: set_games
#
#  id               :integer          not null, primary key
#  ordinal          :integer          not null
#  match_set_id     :integer          not null
#  team_winner_id   :integer
#  created_at       :datetime         not null
#  updated_at       :datetime         not null
#  player_server_id :integer
#  tiebreaker       :boolean          default(FALSE), not null
#

FactoryGirl.define do

  factory :set_game, class: SetGame do
    transient do
      match_title 'factory match'
    end

    ordinal 1
    match_set_id do
      match = Match.find_by(title: match_title) || FactoryGirl.create(:singles_match, title: match_title)
      set = match.match_sets.find_by(ordinal: 1) || FactoryGirl.create(:match_set, match_title: match_title)
      set.id
    end
  end

end

