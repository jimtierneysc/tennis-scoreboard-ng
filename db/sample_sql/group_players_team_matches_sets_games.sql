/* game winning percentage */
SELECT
  team_name, games_played, wins, loses,
  case when games_played > 0 then

    ROUND(100.0 *
        wins / games_played, 1) else 0 end win_percent
  from
(SELECT
  --players.name      player_name,
  teams.name        team_name,
  count(set_games.team_winner_id) games_played,
  --teams.id          team_id,
  --matches.title     match_title,
  --matches.id        matches_id,
  --match_sets.id     match_sets_id,
  --set_games.id      set_games_id,
  --set_games.ordinal set_games_ordinal,
   SUM(case set_games.team_winner_id when teams.id then 1 else 0 end) wins,
  SUM(case when set_games.team_winner_id is not null and set_games.team_winner_id != teams.id then 1 else 0 end) loses
FROM players
  LEFT OUTER JOIN
  teams
    ON players.id IN (teams.first_player_id, teams.second_player_id)
  LEFT OUTER JOIN matches
    ON teams.id IN (matches.first_team_id, matches.second_team_id)
  LEFT OUTER JOIN match_sets
    ON match_sets.match_id = matches.id
  LEFT OUTER JOIN set_games
    ON set_games.match_set_id = match_sets.id
group by teams.name) nested;







