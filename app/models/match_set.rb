# Model for a set in a match.
# A set may has a state: in progress, finished and complete.
# Finished and complete sets both have a winner.  Complete mean that
# the scorer has confirmed the finished score.
# Sets are contained within a match.
# Games are contained within a set.
# A match tiebreaker is a special kind of set with only one game.
# A set has an ordinal.  The first set in the match has ordinal 1.
class MatchSet < ActiveRecord::Base
  has_many :set_games, dependent: :destroy
  belongs_to :first_player_server,
             class_name: 'Player', foreign_key: :first_player_server_id
  belongs_to :second_player_server,
             class_name: 'Player', foreign_key: :second_player_server_id
  belongs_to :team_winner,
             class_name: 'Team', foreign_key: :team_winner_id
  belongs_to :match
  validates :ordinal, :scoring, :match, presence: true
  validate :that_scoring_is_known
  default_scope { order('ordinal ASC') }

  def games_won(team)
    raise Exceptions::InvalidOperation, 'Use #tiebreaker_won?' if tiebreaker?
    lookup_games_won[team.id][0]
  end

  def games_won_ordinal(team, game_ordinal)
    raise Exceptions::InvalidOperation, 'Use #tiebreaker_won?' if tiebreaker?
    lookup_games_won[team.id][game_ordinal]
  end

  def tiebreaker_won?(team)
    raise Exceptions::InvalidOperation, 'Use #games_won.' unless tiebreaker?
    lookup_games_won[team.id][0] > 0
  end

  def completed?
    team_winner_id
  end

  def state
    if completed?
      :complete
    elsif compute_team_winner
      :finished
    else
      :in_progress
    end
  end

  def compute_team_winner
    lookup = lookup_games_won
    # pass games won by each team
    calc_winner_team(lookup[match.first_team_id][0],
                     lookup[match.second_team_id][0])
  end

  def scores
    lookup = lookup_games_won
    [lookup[match.first_team_id][0], lookup[match.second_team_id][0]]
  end

  def winner_score
    raise Exceptions::InvalidOperation, 'No winner' unless compute_team_winner
    scores.max
  end

  def loser_score
    raise Exceptions::InvalidOperation, 'No loser' unless compute_team_winner
    scores.min
  end

  def last_game
    set_games.last
  end

  def win_threshold
    case scoring.to_sym
    when :six_game
      6
    when :eight_game
      8
    when :ten_point
      1
    else
      raise ArgumentError, "Unknown scoring: #{scoring}"
    end
  end

  def tiebreaker?
    scoring.to_sym == :ten_point
  end

  def tiebreaker_game?(game_ordinal)
    tiebreaker_ordinal = (win_threshold == 1) ? 1 : win_threshold * 2 + 1
    game_ordinal == tiebreaker_ordinal
  end

  # Notification to clear cached values
  def score_changed
    @games_won_by_team = nil
  end

  private

  def that_scoring_is_known
    unless scoring.blank?
      s = [:six_game, :eight_game, :ten_point]
      errors.add(:scoring, 'invalid value') unless s.include? scoring.to_sym
    end
  end

  def calc_winner_team(first_team_wins, second_team_wins)
    won = if win_threshold >= 2
            calc_winner_by_games(first_team_wins, second_team_wins)
          else
            [first_team_wins, second_team_wins].max == 1
          end
    if won
      first_team_wins > second_team_wins ? match.first_team : match.second_team
    end
  end

  def calc_winner_by_games(first_team_wins, second_team_wins)
    threshold = win_threshold
    minmax = [first_team_wins, second_team_wins].minmax
    win_by_two = (first_team_wins - second_team_wins).abs >= 2 &&
      minmax[1] >= threshold
    win_tiebreaker = minmax == [threshold, threshold + 1]
    win_by_two || win_tiebreaker
  end

  def lookup_games_won
    if @games_won_by_team
      # cache for slight performance improvement
      return @games_won_by_team
    end
    lookup = {}
    sum_wins do |first_wins, second_wins|
      lookup = { match.first_team_id => first_wins,
                 match.second_team_id => second_wins }
    end
    @games_won_by_team = lookup
    lookup
  end

  def sum_wins
    first_wins = [0]
    second_wins = [0]
    sum_set_games do |sum1, sum2|
      first_wins << sum1
      second_wins << sum2
    end
    first_wins[0] = first_wins.last
    second_wins[0] = second_wins.last
    yield first_wins, second_wins
  end

  def sum_set_games
    sum1 = sum2 = 0
    set_games.each do |game|
      break unless game.team_winner
      if game.team_winner == match.first_team
        sum1 += 1
      else
        sum2 += 1
      end
      yield sum1, sum2
    end
  end
end
