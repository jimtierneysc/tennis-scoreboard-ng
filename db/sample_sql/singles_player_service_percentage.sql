/* game winning percentage */
SELECT
  player_name,
  games_served,
  wins,
  loses,
  CASE WHEN games_served > 0
    THEN

      ROUND(100.0 *
            wins / games_served, 1)
  ELSE 0 END win_percent
FROM
  (
    SELECT
      players.name                    player_name,
      --teams.name        team_name,
      count(set_games.team_winner_id) games_served,
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
    FROM players
      LEFT OUTER JOIN
      teams
        ON players.id IN (teams.first_player_id) AND teams.second_player_id IS NULL
      LEFT OUTER JOIN matches
        ON teams.id IN (matches.first_team_id, matches.second_team_id)
      LEFT OUTER JOIN match_sets
        ON match_sets.match_id = matches.id
      LEFT OUTER JOIN set_games
        ON set_games.match_set_id = match_sets.id and set_games.player_server_id = players.id
    GROUP BY (players.name)) counts
ORDER BY win_percent DESC;









