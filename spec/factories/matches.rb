# Read about factories at https://github.com/thoughtbot/factory_girl


def find_or_create_player(player_name)
  (Player.find_by(name: player_name) || FactoryGirl.create(:player, name: player_name))
end


FactoryGirl.define do

  factory :doubles_match, class: Match do
    transient do
      match_title 'doubles_match'
      first_player_name 'first'
      second_player_name 'second'
      third_player_name 'third'
      fourth_player_name 'fourth'
      first_team_name 'first'
      second_team_name 'second'
    end

    title do
      match_title
    end
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


    factory :singles_match, class: Match do
      transient do
        match_title 'singles match'
        first_player_name 'first'
        second_player_name 'second'
      end

      title do
        match_title
      end
      scoring :one_eight_game
      doubles false

      trait :team_ids do
        first_team_id do
          p1 = find_or_create_player(first_player_name) #(Player.find_by(name: first_player_name) || FactoryGirl.create(:player, name: first_player_name))
          p1.singles_team!.id
        end
        second_team_id do
          p2 = find_or_create_player(second_player_name) #(Player.find_by(name: second_player_name) || FactoryGirl.create(:player, name: second_player_name))
          p2.singles_team!.id
        end
      end

      trait :player_ids do
        first_player_id do
          p1 = find_or_create_player(first_player_name) #(Player.find_by(name: first_player_name) || FactoryGirl.create(:player, name: first_player_name))
          p1.id
        end
        second_player_id do
          p2 = find_or_create_player(second_player_name) #(Player.find_by(name: second_player_name) || FactoryGirl.create(:player, name: second_player_name))
          p2.id
        end
      end
    end


  end

end
