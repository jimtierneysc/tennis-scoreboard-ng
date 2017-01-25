/* game winning percentage */
SELECT
  team_name,
  --team_doubles,
  games_played,
  wins,
  loses,
  CASE WHEN games_played > 0
    THEN

      ROUND(100.0 *
            wins / games_played, 1)
  ELSE 0 END win_percent
FROM
  (SELECT
     --players.name      player_name,
     teams.name                      team_name,
     teams.doubles team_doubles,
     count(set_games.team_winner_id) games_played,
     --teams.id          team_id,
     --matches.title     match_title,
     --matches.id        matches_id,
     --match_sets.id     match_sets_id,
     --set_games.id      set_games_id,
     --set_games.ordinal set_games_ordinal,
     SUM(CASE set_games.team_winner_id
         WHEN teams.id
           THEN 1
         ELSE 0 END)                 wins,
     SUM(CASE WHEN set_games.team_winner_id IS NOT NULL AND set_games.team_winner_id != teams.id
       THEN 1
         ELSE 0 END)                 loses
   FROM
     teams
     LEFT OUTER JOIN matches
       ON teams.id IN (matches.first_team_id, matches.second_team_id)
     LEFT OUTER JOIN match_sets
       ON match_sets.match_id = matches.id
     LEFT OUTER JOIN set_games
       ON set_games.match_set_id = match_sets.id
   GROUP BY teams.name, teams.doubles) nested
where team_doubles = TRUE;







