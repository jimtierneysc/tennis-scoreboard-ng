require 'test_helper'
require 'play_match_helper'

# Test the Match model.
# The Match model has methods to advance the score of the
# match and methods to determine whether the score can be advanced.
# Matches may have different numbers of sets and length of sets.
# Matches may be singles or doubles.  Singles matches have a first server.
# Doubles matches have a first server and a second server.
class MatchTest < ActiveSupport::TestCase

  def check_change_score(method, match, actions)
    unless actions.respond_to? :each
      actions = [actions]
    end
    actions.each do |action|
      method.call match.change_score?(action), "change score #{action}"
      method.call match.score_actions.has_key?(action), "change state #{action}"
    end
  end

  def assert_change_score(match, actions)
    check_change_score(method(:assert), match, actions)
  end

  def refute_change_score(match, actions)
    check_change_score(method(:refute), match, actions)
  end


  def assert_change_states(match, actions)
    actions.each { |a| assert_change_state }
  end

  test 'should initialize two set match' do
    match = matches(:m_two_six_game_ten_point_doubles).change_score! :start_play
    # match.change_score! :start_next_set
    match.change_score! :start_next_set if match.change_score? :start_next_set
    assert_equal 1, match.match_sets.count
    assert_equal 6, match.first_set.win_threshold
  end

  test 'should initialize three set match' do
    match = matches(:m_three_six_game_doubles).change_score! :start_play
    # match.change_score! :start_next_set
    match.change_score! :start_next_set if match.change_score? :start_next_set
    assert_equal 1, match.match_sets.count
    assert_equal 6, match.first_set.win_threshold
  end

  test 'should initialize eight game match' do
    match = matches(:m_one_eight_game_doubles).change_score! :start_play
    match.change_score! :start_next_set if match.change_score? :start_next_set
    assert_equal 1, match.match_sets.count
    assert_equal 8, match.first_set.win_threshold
  end

  test 'should start set' do
    match = matches(:m_one_eight_game_doubles).change_score! :start_play
    match.change_score! :start_next_set if match.change_score? :start_next_set
    assert match.first_set
    assert match.first_set
  end

  test 'should start game' do
    match = matches(:m_one_eight_game_doubles).change_score! :start_play
    match.change_score! :start_next_set if match.change_score? :start_next_set
    match.change_score! :start_next_game
    assert match.first_set.last_game
  end

  test 'should win game' do
    match = matches(:m_one_eight_game_doubles).change_score! :start_play
    match.change_score! :start_next_set if match.change_score? :start_next_set
    match.change_score! :start_next_game
    match.change_score! :win_game, match.first_team
    assert_equal match.first_set.last_game.team_winner, match.first_team
    assert_equal match.first_set.last_game.team_winner, match.first_team
  end

  def do_win_set(match, winner)
    match.change_score! :start_next_set if match.change_score? :start_next_set
    (1..match.last_set.win_threshold).each do
      match.change_score! :start_next_game
      match.change_score! :win_game, winner
    end
    assert_equal match.last_set.compute_team_winner, winner
  end

  def do_win_match_tiebreaker(match, winner)
    match.change_score! :start_match_tiebreaker
    match.change_score! :win_match_tiebreaker, winner
    assert_equal match.last_set.compute_team_winner, winner
  end

  def do_win_two_sets_and_match_tiebreaker(match)
    do_win_set match, match.first_team
    match.change_score! :complete_set_play
    do_win_set match, match.second_team
    match.change_score! :complete_set_play
    do_win_match_tiebreaker match, match.first_team
  end

  def do_win_set_first_team(match)
    winner = match.first_team
    do_win_set match, winner
  end

  test 'should win six game set' do
    match = matches(:m_two_six_game_ten_point_doubles).change_score! :start_play
    do_win_set_first_team match
  end

  test 'should win eight game set' do
    match = matches(:m_one_eight_game_doubles).change_score! :start_play
    do_win_set_first_team match
  end

  def do_win_tiebreaker(match)
    match.change_score! :start_next_set if match.change_score? :start_next_set
    do_win_equal_number_of_games(match)
    winner = match.second_team
    match.change_score! :start_tiebreaker
    match.change_score! :win_tiebreaker, winner
    assert_equal match.last_set.compute_team_winner, winner
  end

  def do_win_equal_number_of_games(match)
    winner1 = match.first_team
    winner2 = match.second_team
    (1..match.last_set.win_threshold * 2).each do |ordinal|
      match.change_score! :start_next_game
      winner = ordinal.even? ? winner1 : winner2
      match.change_score! :win_game, winner
    end
    refute match.compute_team_winner
  end

  test 'should win 6 game set tie breaker' do
    match = matches(:m_three_six_game_doubles).change_score! :start_play
    do_win_tiebreaker match
  end

  test 'should win 8 game set tie breaker' do
    match = matches(:m_one_eight_game_doubles).change_score! :start_play
    do_win_tiebreaker match
  end

  test 'should win 3 6 game sets' do
    match = matches(:m_three_six_game_doubles).change_score! :start_play
    do_win_set match, match.first_team
    match.change_score! :complete_set_play
    do_win_set match, match.second_team
    match.change_score! :complete_set_play
    do_win_set match, match.first_team
    assert_equal match.first_team, match.compute_team_winner
  end

  test 'should win match of 2 6 game sets' do
    match = matches(:m_three_six_game_doubles).change_score! :start_play
    do_win_set match, match.first_team
    match.change_score! :complete_set_play
    do_win_set match, match.first_team
    assert_equal match.first_team, match.compute_team_winner
  end

  test 'should win match of 2 6 game sets and ten point' do
    match = matches(:m_two_six_game_ten_point_doubles).change_score! :start_play
    do_win_two_sets_and_match_tiebreaker match
    assert_equal match.first_team, match.compute_team_winner
  end

  test 'should win match of 8 game set' do
    match = matches(:m_one_eight_game_doubles).change_score! :start_play
    do_win_set match, match.first_team
    assert_equal match.first_team, match.compute_team_winner
  end

  test 'should discard match play' do
    match = matches(:m_three_six_game_doubles).change_score! :start_play
    do_win_set_first_team match
    match.change_score! :discard_play
    assert_equal 0, match.match_sets.count
  end

  test 'should not start third set if match over' do
    match = matches(:m_three_six_game_doubles).change_score! :start_play
    do_win_set_first_team match
    match.change_score! :complete_set_play
    do_win_set_first_team match
    match.change_score! :complete_set_play
    # refute match.change_score? :start_next_set
    refute_change_score match, :start_next_set
  end

  test 'should allow discard set after won' do
    match = matches(:m_three_six_game_doubles).change_score! :start_play
    do_win_set match, match.first_team
    assert match.change_score? :remove_last_change
  end

  def do_win_matchset_check_modify(match, team)
    refute_change_score match, [:win_game, :win_tiebreaker, :complete_set_play,
                                :win_match_tiebreaker]
    do_win_set match, team

    assert_change_score match, :complete_set_play
  end

  test 'should modify match sets' do
    match = matches(:m_three_six_game_doubles).change_score! :start_play

    do_win_matchset_check_modify match, match.first_team
    match.change_score! :complete_set_play

    do_win_matchset_check_modify match, match.second_team
    match.change_score! :complete_set_play

    do_win_matchset_check_modify match, match.second_team
    refute match.change_score? :complete_play
    match.change_score! :complete_set_play
    assert match.change_score? :complete_play
    match.change_score! :complete_play
  end

  test 'should allow actions after start match' do
    match = matches(:m_three_six_game_doubles).change_score! :start_play
    assert match.change_score? :start_next_game
  end

  def start_singles_with_server(match, server)
    match.first_player_server = server
    match.change_score! :start_next_set if match.change_score? :start_next_set
  end

  def start_doubles_with_server(match, server1, server2)
    match.first_player_server = server1
    match.second_player_server = server2
    match.change_score! :start_next_set if match.change_score? :start_next_set
  end

  test 'that singles players hold serve' do
    match = matches(:m_three_six_game_singles).change_score! :start_play
    first_server = match.first_singles_player
    second_server = match.second_singles_player
    start_singles_with_server match, first_server

    game = match.change_score! :start_next_game
    assert_equal first_server, game.player_server
    game = match.change_score! :win_game, match.first_team
    assert_equal true, game.service_hold?

    game = match.change_score! :start_next_game
    assert_equal second_server, game.player_server
    game = match.change_score! :win_game, match.first_team
    refute game.service_hold?

    game = match.change_score! :start_next_game
    assert_equal first_server, game.player_server
  end

  test 'that doubles players hold serve' do
    match = matches(:m_three_six_game_doubles).change_score! :start_play
    first_server = match.first_team.first_player
    second_server = match.second_team.second_player
    third_server = match.first_team.second_player
    fourth_server = match.second_team.first_player
    start_doubles_with_server match, first_server, nil

    game = match.change_score! :start_next_game
    assert_equal first_server, game.player_server
    game = match.change_score! :win_game, match.first_team
    assert game.service_hold?

    # don't need second server until second game
    match.second_player_server = second_server
    game = match.change_score! :start_next_game
    assert_equal second_server, game.player_server
    game = match.change_score! :win_game, match.first_team
    refute game.service_hold?

    game = match.change_score! :start_next_game
    assert_equal third_server, game.player_server
    game = match.change_score! :win_game, match.second_team
    refute game.service_hold?

    game = match.change_score! :start_next_game
    assert_equal fourth_server, game.player_server
    game = match.change_score! :win_game, match.second_team
    assert_equal true, game.service_hold?

    game = match.change_score! :start_next_game
    assert_equal first_server, game.player_server
  end

  test 'should require first servers on different teams' do
    match = matches(:m_two_six_game_ten_point_doubles)
    match.first_player_server = match.first_team.first_player
    match.second_player_server = match.first_team.second_player
    assert_not match.valid?
    match.first_player_server = match.second_team.first_player
    match.second_player_server = match.second_team.second_player
    assert_not match.valid?
  end

  test 'that doubles players can serve first' do
    match = matches(:m_two_six_game_ten_point_doubles).change_score! :start_play
    match.first_player_server = nil
    match.second_player_server = nil
    match.save!

    players = match.players_that_may_serve_first
    assert_equal 4, players.count
    assert_equal players, players & match.players

    match.apply_first_or_second_player_server match.first_team.first_player
    match.change_score! :start_next_game
    players = match.players_that_may_serve_first
    assert_equal 2, players.count
    assert_equal players, players & match.second_team.players

    match.change_score! :win_game, match.first_team
    match.apply_first_or_second_player_server match.second_team.first_player
    match.change_score! :start_next_game
    players = match.players_that_may_serve_first
    assert_equal [], players
  end

  test 'that singles players can serve first' do
    match = matches(:m_two_six_game_ten_point_singles).change_score! :start_play
    match.first_player_server = nil
    match.second_player_server = nil
    match.save!

    players = match.players_that_may_serve_first
    assert_equal 2, players.count
    assert_equal players, players & match.players

    match.apply_first_or_second_player_server match.second_team.first_player
    match.change_score! :start_next_game
    players = match.players_that_may_serve_first
    assert_equal [], players
  end

  test 'that cannot change doubles server after match started' do
    match = matches(:m_two_six_game_ten_point_singles).change_score! :start_play
    match.change_score! :start_next_set if match.change_score? :start_next_set
    # match.start_set_play
    match.first_player_server = match.first_singles_player
    match.change_score! :start_next_game
    match.change_score! :win_game, match.first_team
    # match.save!
    match.first_player_server = match.second_singles_player
    refute match.valid?
  end

  test 'that cannot change team after match started' do
    match = matches(:m_two_six_game_ten_point_doubles).change_score! :start_play
    match.first_team = teams(:orphan)
    refute match.valid?
  end

  test 'that cannot change singles player after match started' do
    match = matches(:m_two_six_game_ten_point_singles).change_score! :start_play
    match.first_singles_player = players(:orphan)
    refute match.valid?
  end

  test 'that cannot change scoring after match started' do
    match = matches(:m_two_six_game_ten_point_singles).change_score! :start_play
    match.scoring = matches(:m_one_eight_game_singles).scoring
    refute match.valid?
  end

  test 'Cannot undo if no changes' do
    match = matches(:m_two_six_game_ten_point_doubles)
    refute_change_score match, [:remove_last_change, :discard_play]
  end

  test 'Can undo if play started' do
    match = matches(:m_two_six_game_ten_point_doubles).change_score! :start_play
    assert_change_score match, [:remove_last_change, :discard_play]
  end

  test 'should undo start' do
    match = matches(:m_one_eight_game_doubles).change_score! :start_play
    assert match.started
    assert match.change_score? :start_next_game
    match.change_score! :remove_last_change
    refute match.started
  end

  test 'should undo start set' do
    match = matches(:m_one_eight_game_doubles).change_score! :start_play
    match.change_score! :start_next_set if match.change_score? :start_next_set
    assert match.first_set
    match.change_score! :remove_last_change
    match.reload
    assert_equal nil, match.first_set
  end

  test 'should undo start game' do
    match = matches(:m_one_eight_game_doubles).change_score! :start_play
    match.change_score! :start_next_set if match.change_score? :start_next_set
    match.change_score! :start_next_game
    assert match.first_set.last_game
    match.change_score! :remove_last_change
    match.first_set.reload
    refute match.first_set.last_game
  end

  test 'should undo first servers' do
    match = matches(:m_one_eight_game_doubles).change_score! :start_play
    match.change_score! :start_next_set if match.change_score? :start_next_set
    match.change_score! :start_next_game
    match.change_score! :win_game, match.first_team
    match.change_score! :start_next_game
    assert match.first_player_server
    assert match.second_player_server
    match.change_score! :remove_last_change # Undo start game
    refute match.second_player_server
    match.last_set.reload
    match.change_score! :remove_last_change # Undo win game
    match.change_score! :remove_last_change # Undo start game
    refute match.first_player_server
  end

  test 'should undo win game' do
    match = matches(:m_one_eight_game_doubles).change_score! :start_play
    match.change_score! :start_next_set if match.change_score? :start_next_set
    match.change_score! :start_next_game
    match.change_score! :win_game, match.first_team
    assert_equal match.last_set.last_game.team_winner, match.first_team
    match.change_score! :remove_last_change
    refute match.last_set.last_game.team_winner
  end

  test 'should undo complete set' do
    match = matches(:m_three_six_game_doubles).change_score! :start_play
    do_win_set match, match.first_team
    assert match.change_score? :complete_set_play
    match.change_score! :complete_set_play
    refute match.change_score? :complete_set_play
    match.change_score! :remove_last_change
    assert match.first_set # should not be deleted
    assert match.change_score? :complete_set_play
  end

  test 'should undo match tiebreaker' do
    match = matches(:m_two_six_game_ten_point_doubles).change_score! :start_play
    do_win_two_sets_and_match_tiebreaker match
    refute match.change_score? :win_match_tiebreaker
    match.change_score! :remove_last_change
    assert match.change_score? :win_match_tiebreaker
    match.change_score! :remove_last_change
    match.save!
    assert_equal 2, match.match_sets.count
  end

  def do_play_entire_match(match, simplified_scores)
    scores = PlayMatchHelper.make_match_score simplified_scores
    PlayMatchHelper.play_match(match, scores)
    assert match.completed?
    assert match.team_winner
  end

  test 'that correct scores are generated' do
    scores = PlayMatchHelper.make_match_score [[4, 6], [7, 6], [1, 0]]
    assert_equal 3, scores.count
    assert_equal 10, scores[0].count
    assert_equal 4, count_w(scores[0], 'w')
    assert_equal 13, scores[1].count
    assert_equal 7, count_w(scores[1], 'w')
    assert_equal 1, scores[2].count
    assert_equal 1, count_w(scores[2], 'w')
  end

  def count_w(scores, w_or_l)
    scores.reduce(0) { |a, e| a + (e == w_or_l ? 1 : 0) }
  end

  test 'should play entire match doubles' do
    match = matches(:m_two_six_game_ten_point_doubles)
    do_play_entire_match(match, [[4, 6], [6, 4], [1, 0]])
  end

  test 'should play entire match singles' do
    match = matches(:m_two_six_game_ten_point_singles)
    do_play_entire_match(match, [[4, 6], [6, 4], [1, 0]])
  end

  def server_of_game(match, set_ordinal, game_ordinal)
    match.match_sets[set_ordinal].set_games[game_ordinal].player_server
  end

  test 'that have correct first server singles' do
    match = matches(:m_three_six_game_singles)
    do_play_entire_match(match, [[1, 6], [6, 1], [6, 0]])
    # check games in first set
    assert_equal match.first_player_server, server_of_game(match, 0, 0)
    assert_not_equal match.first_player_server, server_of_game(match, 0, 1)
    # check game in second set
    assert_equal match.first_player_server, server_of_game(match, 1, 1)
    # check games in third set
    assert_equal match.first_player_server, server_of_game(match, 2, 2)
  end

  test 'that have correct first server doubles' do
    match = matches(:m_three_six_game_doubles)
    do_play_entire_match(match, [[1, 6], [6, 1], [6, 0]])
    # check games in first set
    assert_equal match.first_player_server, server_of_game(match, 0, 0)
    assert_equal match.second_player_server, server_of_game(match, 0, 1)
    # check games in second set
    assert_equal match.first_player_server, server_of_game(match, 1, 1)
    assert_equal match.second_player_server, server_of_game(match, 1, 2)
    # check games in third set
    assert_equal match.first_player_server, server_of_game(match, 2, 2)
    assert_equal match.second_player_server, server_of_game(match, 2, 3)
  end

  test 'that have correct first server tiebreaker singles' do
    match = matches(:m_three_six_game_singles)
    do_play_entire_match(match, [[1, 6], [7, 6], [6, 0]])
    # tiebreaker should be ignored when determining servers
    assert_equal match.first_player_server, server_of_game(match, 2, 1)
  end

  test 'that have correct first server tiebreaker doubles' do
    match = matches(:m_three_six_game_doubles)
    do_play_entire_match(match, [[1, 6], [7, 6], [6, 0]])
    # tiebreaker should be ignored when determining servers
    assert_equal match.first_player_server, server_of_game(match, 2, 1)
  end
end
