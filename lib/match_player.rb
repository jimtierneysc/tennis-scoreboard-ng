# Class to help "play" a match.  This class is used to generate seed data and test data.
#
class MatchPlayer

  # Class method to play a match.
  # Calls #play
  # * *Args*    :
  #   - +match+ -> Match
  #   - +scores+ -> Array
  #     - Array of characters within an array of sets
  def self.play(match, scores)
    MatchPlayer.new(match).play(scores)
  end

  # Convert an array of numeric scores into an array of
  # character scores.
  # This method is convenient for creating scores when the
  # exact order of wins and losses is not important.
  # Pass the result of this method to #play or ::play
  #
  # * *Args*    :
  #   - +scores+ -> Array
  #     - Array of numeric pairs within an array of sets
  # * *Returns* : Array
  #   - Array of characters within an array of sets
  #
  # === Scores Example
  #   [[6, 2],[3,2]]
  #
  # This array of numeric scores result in the following array of character scores:
  #   [['w', 'l', 'w', 'l', 'w', 'w', 'w', 'w'], ['w', 'l', 'w', 'l', 'w']]
  def self.convert_scores(scores)
    scores.map { |pair| convert_set_score(pair[0], pair[1]) }
  end

  # * *Args*    :
  #   - +match+ -> Match
  def initialize(match)
    @match = match
  end

  # Play a match
  # * *Args*    :
  #   - +scores+ -> array of set scores
  #     - Array of characters within an array of sets
  #
  # === Scores Example
  #   [['l', 'w', 'w', 'w', 'w', 'w', 'w'], ['w', 'l', 'w', 'l', 'w']]
  #
  # This array indicates that the first opponent is to win the first set 6-1,
  # and be ahead 3-2 in the second.
  #
  def play(scores)
    match.play_match! :start_play
    # apply_first_servers
    scores.each { |v| play_set(v) }
  end

  # Start the match by executing the
  # +:start_play+ action
  def start_play
    match.save!
    if match.play_match? :start_play
      match.play_match! :start_play
    end
  end

  # Start the match and start the first game by executing the
  # +:start_play+ and +:start_game+ actions
  def start_first_game
    start_play
    if match.play_match?(:start_game) && no_games?
      if match.doubles
        match.play_match! :start_game, opponent: match.first_team.first_player
      else
        match.play_match! :start_game, opponent: match.first_player
      end
    end
  end

  # Start the next set by executing the
  # +:start_set+ action
  def start_set_game
    # Starting set also starts first game
    match.play_match! :start_set
  end

  # Indicate that the first opponent is to win
  FIRST_OPPONENT_WIN = %w(w).freeze
  # Indicate that the second opponent is to win
  SECOND_OPPONENT_WIN = %w(l).freeze

  private

  attr_reader :match

  # Play a set
  def play_set(scores)
    start_set
    play_games(scores)
  end

  # Create an array of 'w' and 'l' that may be passed to #play_set
  # Parameter values first_wins: 6, second_wins: 1 would return
  # %w(w l w w w w w).
  def self.convert_set_score(first_wins, second_wins)
    score = []
    # mix wins and losses so that set is not won prematurely
    min = [first_wins, second_wins].min
    1.upto(min) { score << FIRST_OPPONENT_WIN + SECOND_OPPONENT_WIN }
    # now, add winning games
    win = if first_wins > second_wins
            FIRST_OPPONENT_WIN
          else
            SECOND_OPPONENT_WIN
          end
    1.upto((first_wins - second_wins).abs) { score << win }
    score.flatten
  end

  def no_games?
    match.match_sets.count == 1 && match.match_sets[0].set_games.count == 0
  end

  def start_set
    if match.play_match? :start_match_tiebreak
      match.play_match! :start_match_tiebreak
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
    elsif match.play_match? :win_match_tiebreak
      match.play_match! :win_match_tiebreak, opponent: winner
    elsif match.play_match?(:start_tiebreak) || match.play_match?(:win_tiebreak)
      play_tiebreak winner
    else
      invalid_game
    end
  end

  def play_tiebreak(winner)
    if match.play_match? :start_tiebreak
      match.play_match! :start_tiebreak
    end
    match.play_match! :win_tiebreak, opponent: winner
  end

  def play_normal_game(winner)
    if match.play_match? :start_game
      # May need a first server
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
      match.play_match! :start_game, opponent: param
    end
    match.play_match! :win_game, opponent: winner
  end

  def invalid_game
    raise "Invalid game. Set: #{match.last_set.ordinal},"\
            "Game: #{match.last_set.last_game.ordinal}"
  end
end
