# PlayMatchHelper is used to generate sample scores into a match.
# An array like this: %w(w l) indicate a one game win for the first opponent
# and a one game loss for the second opponent.
class PlayMatchHelper
  FIRST_PLAYER_WIN = %w(w).freeze
  SECOND_PLAYER_WIN = %w(l).freeze

  def initialize(match)
    @match = match
  end

  attr_reader :match

  # Class method to play a match.
  # The scores parameter is an array of an array of characters.
  # Each element in the array represents a set.
  def self.play_match(match, scores)
    PlayMatchHelper.new(match).play(scores)
  end

  # Class method to play a set.
  # The scores parameter is an array of characters.
  # examples:
  # %w(w w w w w w)  # complete set
  # %w(w l l w)  # incomplete set
  def self.play_match_set(match, scores)
    PlayMatchHelper.new(match).play_set(scores)
  end

  # Create an array of "w" and "l" that may be passed to #play_set
  # Parameter values first_wins: 6, second_wins: 1 would return
  # %w(w l w w w w w).
  # This method is convenient for creating a score when the
  # exact order of wins and losses in not important.
  def self.make_set_score(first_wins, second_wins)
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

  # Create an array of set scores that may be passed to #play
  def self.make_match_score(set_scores)
    set_scores.map { |pair| make_set_score(pair[0], pair[1]) }
  end

  # Play a match
  def play(scores)
    match.change_score! :start_play
    apply_first_servers
    scores.each { |v| play_set(v) }
    match.change_score! :complete_play if match.change_score?(:complete_play)
  end

  # Play a set
  def play_set(scores)
    start_set
    play_games(scores)
    complete_set
  end

  private

  # Make sure the first servers are assigned
  def apply_first_servers
    apply_first_server
    apply_second_server
  end

  def apply_first_server
    if match.first_player_server.nil?
      match.apply_first_or_second_player_server(match.first_team.first_player)
    end
  end

  def apply_second_server
    if match.doubles && match.second_player_server.nil?
      match.apply_first_or_second_player_server(match.second_team.first_player)
    end
  end

  def start_set
    if match.change_score? :start_match_tiebreaker
      match.change_score! :start_match_tiebreaker
    else
      match.change_score! :start_next_set
    end
  end

  def complete_set
    if match.change_score? :complete_set_play
      match.change_score! :complete_set_play
    elsif match.change_score? :complete_match_tiebreaker
      match.change_score! :complete_match_tiebreaker
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
    if match.change_score? :start_next_game
      play_normal_game winner
    elsif match.change_score? :win_match_tiebreaker
      match.change_score! :win_match_tiebreaker, winner
    elsif match.change_score? :start_tiebreaker
      play_tiebreaker winner
    else
      invalid_game
    end
  end

  def play_tiebreaker(winner)
    match.change_score! :start_tiebreaker
    match.change_score! :win_tiebreaker, winner
  end

  def play_normal_game(winner)
    match.change_score! :start_next_game
    match.change_score! :win_game, winner
  end

  def invalid_game
    raise "Invalid game. Set: #{match.last_set.ordinal},"\
            "Game: #{match.last_set.last_game.ordinal}"
  end
end
