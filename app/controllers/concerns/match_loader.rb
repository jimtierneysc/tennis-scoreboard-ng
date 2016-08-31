# Match loading for controllers
module MatchLoader
  # Load match, sets, games, teams and players at once.
  # * *Args*    :
  #   - +match_id+ -> match to load
  # * *Returns* : Relation
  def eager_load_match(match_id)
    Match
      .includes(first_team: [:first_player,
                             :second_player],
                second_team: [:first_player,
                              :second_player],
                match_sets: [set_games:
                               [:player_server,
                                :team_winner]])
      .find(match_id)
  end
end