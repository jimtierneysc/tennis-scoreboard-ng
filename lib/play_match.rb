# PlayMatch is used to play a match.
# An array like this: %w(w l) indicate a one game win for the first opponent
# and a one game loss for the second opponent.
class PlayMatch
  FIRST_PLAYER_WIN = %w(w).freeze
  SECOND_PLAYER_WIN = %w(l).freeze

  def initialize(match)
    @match = match
  end

  attr_reader :match

  # Play a match.
  def self.play_match(match, scores, options={})
    PlayMatch.new(match).play(scores, options)
  end

  # Create an array of set scores that may be passed to #play
  def self.convert_scores(set_scores)
    set_scores.map { |pair| convert_set_score(pair[0], pair[1]) }
  end

  # Play a match
  # === options
  # [complete_set: true]
  # [complete_match: true]
  def play(scores, options={})
    match.play_match! :start_play
    # apply_first_servers
    scores.each { |v| play_set(v, options) }
  end

  # Play a set
  # === options
  # [complete_set: true]
  #
  def play_set(scores, options={})
    start_set
    play_games(scores)
  end

  def start_play
    match.save!
    if match.play_match? :start_play
      match.play_match! :start_play
    end
  end

  def start_first_game
    start_play
    if match.play_match?(:start_game) && no_games?
      if match.doubles
        match.play_match! :start_game, player: match.first_team.first_player
      else
        match.play_match! :start_game, player: match.first_player
      end
    end
  end

  def start_set_game
    match.play_match! :start_set
  end

  private

  # Create an array of "w" and "l" that may be passed to #play_set
  # Parameter values first_wins: 6, second_wins: 1 would return
  # %w(w l w w w w w).
  # This method is convenient for creating a score when the
  # exact order of wins and losses in not important.
  def self.convert_set_score(first_wins, second_wins)
    score = []
    # mix wins and losses so that set is not won prematurely
    min = [first_wins, second_wins].min
    1.upto(min) { score << FIRST_PLAYER_WIN + SECOND_PLAYER_WIN }
    # now, add winning games
    win = if first_wins > second_wins
            FIRST_PLAYER_WIN
          else
            SECOND_PLAYER_WIN
          end
    1.upto((first_wins - second_wins).abs) { score << win }
    score.flatten
  end

  def no_games?
    match.match_sets.count == 1 && match.match_sets[0].set_games.count == 0
  end

  def start_set
    if match.play_match? :start_match_tiebreaker
      match.play_match! :start_match_tiebreaker
    elsif match.play_match? :start_set
      match.play_match! :start_set
    end
  end

  def play_games(scores)
    scores.each do |w_or_l|
      winner = if w_or_l == 'w'
                 match.first_team
               else
                 match.second_team
               end
      play_game(winner)
    end
  end

  def play_game(winner)
    if match.play_match?(:start_game) || match.play_match?(:win_game)
      play_normal_game winner
    elsif match.play_match? :win_match_tiebreaker
      match.play_match! :win_match_tiebreaker, opponent: winner
    elsif match.play_match?(:start_tiebreaker) || match.play_match?(:win_tiebreaker)
      play_tiebreaker winner
    else
      invalid_game
    end
  end

  def play_tiebreaker(winner)
    if match.play_match? :start_tiebreaker
      match.play_match! :start_tiebreaker
    end
    match.play_match! :win_tiebreaker, opponent: winner
  end

  def play_normal_game(winner)
    if match.play_match? :start_game
      param = nil
      if match.doubles
        if match.first_player_server.nil?
          param = match.first_team.first_player
        elsif match.second_player_server.nil?
          param = match.second_team.first_player
        end
      else
        if match.first_player_server.nil?
          param = match.first_player
        end
      end
      match.play_match! :start_game, player: param
    end
    match.play_match! :win_game, opponent: winner
  end

  def invalid_game
    raise "Invalid game. Set: #{match.last_set.ordinal},"\
            "Game: #{match.last_set.last_game.ordinal}"
  end
end
