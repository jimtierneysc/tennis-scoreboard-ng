# Read about factories at https://github.com/thoughtbot/factory_girl

FactoryGirl.define do

  factory :doubles_team, class: Team do
    transient do
      first_player_name 'first'
      second_player_name 'second'
    end

    name 'doubles team'
    doubles true
    first_player_id do
      (Player.find_by(name: first_player_name) || FactoryGirl.create(:player, name: first_player_name)).id
    end
    second_player_id do
      (Player.find_by(name: second_player_name) || FactoryGirl.create(:player, name: second_player_name)).id
    end
  end

  factory :singles_team, class: Team do
    transient do
      player_name ''  # required
    end

    name null
    doubles false
    first_player_id do
      (Player.find_by(name: player_name) || FactoryGirl.create(:player, name: player_name)).id
    end
    second_player_id null
  end

end

