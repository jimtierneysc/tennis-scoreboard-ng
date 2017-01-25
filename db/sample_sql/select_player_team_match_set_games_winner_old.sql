/* select match, sets, games for a player */
SELECT
  players.name,
  --players.id       player_id,
  teams.name                          team_name,
  matches.title                       match_title,
  --match_teams.match_id,
  --match_teams.team_id,
  --match_sets.id match_set_id,
  match_sets.ordinal                  set_ordinal,
  set_games.ordinal                   game_ordinal,
  --set_games.id set_games_id,
  --set_games.team_winner_id team_winner_id,
  set_games.team_winner_id = teams.id winner,
  CASE WHEN set_games.player_server_id IS NULL
    THEN '' /* tiebreaker has no server */
  ELSE
    CASE WHEN set_games.player_server_id = players.id
      THEN
        'serving'
    ELSE
      ''
    END
  END                                 serving,
  CASE WHEN set_games.player_server_id = players.id
    THEN
      CASE WHEN set_games.team_winner_id = teams.id
        THEN
          'held'
      ELSE 'broken' END
  ELSE '' END                         "service"
FROM players
  INNER JOIN
  teams
    ON players.id IN (teams.first_player_id, teams.second_player_id)
  INNER JOIN matches
    ON teams.id IN (matches.first_team_id, matches.second_team_id)

  INNER JOIN match_sets
    ON match_sets.match_id = matches.id
  INNER JOIN set_games
    ON set_games.match_set_id = match_sets.id;







