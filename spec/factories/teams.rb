FactoryGirl.define do

  factory :doubles_team, class: Team do
    transient do
      first_player_name 'factory first player'
      second_player_name 'factory second player'
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

end

