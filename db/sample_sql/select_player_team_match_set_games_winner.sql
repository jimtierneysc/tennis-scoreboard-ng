/* select match, sets, games for a player */
SELECT
  players.name,
  --players.id       player_id,
  match_teams.name team_name,
  --matches.title match_title,
  --match_teams.match_id,
  --match_teams.team_id,
  --match_sets.id match_set_id,
  match_sets.ordinal set_ordinal,
  --set_games.id set_games_id,
  set_games.team_winner_id team_winner_id,
  set_games.team_winner_id = match_teams.team_id
FROM players
  INNER JOIN (

               SELECT
                 teams.name,
                 teams.id   team_id,
                 matches.id match_id,
                 teams.first_player_id,
                 teams.second_player_id
               FROM teams
                 INNER JOIN matches
                   ON teams.id IN (matches.first_team_id, matches.second_team_id)) match_teams

    ON players.id IN (match_teams.first_player_id, match_teams.second_player_id)

  INNER JOIN match_sets
    ON match_sets.match_id = match_teams.match_id
inner join set_games
  on set_games.match_set_id = match_sets.id;







