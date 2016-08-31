# == Schema Information
#
# Table name: matches
#
#  id                      :integer          not null, primary key
#  created_at              :datetime         not null
#  updated_at              :datetime         not null
#  first_team_id           :integer          not null
#  second_team_id          :integer          not null
#  scoring                 :string           not null
#  started                 :boolean          default(FALSE), not null
#  doubles                 :boolean          default(FALSE), not null
#  first_player_server_id  :integer
#  second_player_server_id :integer
#  title                   :string
#  team_winner_id          :integer
#  play_version            :integer
#

FactoryGirl.define do

  factory :doubles_match, class: Match do
    transient do
      first_player_name 'factory first player'
      second_player_name 'factory second player'
      third_player_name 'factory third player'
      fourth_player_name 'factory fourth player'
      first_team_name 'factory first team'
      second_team_name 'factory second team'
    end

    title 'doubles match'
    scoring :one_eight_game
    doubles true
    first_team_id do
      (Team.find_by(name: first_team_name) || FactoryGirl.create(:doubles_team,
                                                                 name: first_team_name,
                                                                 first_player_name: first_player_name,
                                                                 second_player_name: second_player_name)).id
    end
    second_team_id do
      (Team.find_by(name: second_team_name) || FactoryGirl.create(:doubles_team,
                                                                  name: second_team_name,
                                                                  first_player_name: third_player_name,
                                                                  second_player_name: fourth_player_name)).id
    end

  end

  factory :singles_match, class: Match do
    transient do
      first_player_name 'first'
      second_player_name 'second'
    end

    title 'singles match'
    scoring :one_eight_game
    doubles false

    first_player do
      MatchFactoryHelper::find_or_create_player(first_player_name)
    end

    second_player do
      MatchFactoryHelper::find_or_create_player(second_player_name)
    end

    # used with FactoryGirl.attributes_for
    trait :player_ids do
      first_player_id do
        p1 = MatchFactoryHelper::find_or_create_player(first_player_name)
        p1.id
      end
      second_player_id do
        p2 = MatchFactoryHelper::find_or_create_player(second_player_name)
        p2.id
      end
    end
  end
end

module MatchFactoryHelper
  def self.find_or_create_player(player_name)
    (Player.find_by(name: player_name) || FactoryGirl.create(:player, name: player_name))
  end
end


