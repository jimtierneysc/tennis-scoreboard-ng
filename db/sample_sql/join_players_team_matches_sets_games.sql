/* select match, sets, games for a player */
SELECT
  players.name      player_name,
  teams.name        team_name,
  teams.id          team_id,
  matches.title     match_title,
  matches.id        matches_id,
  match_sets.id     match_sets_id,
  set_games.id      set_games_id,
  set_games.ordinal set_games_ordinal
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







