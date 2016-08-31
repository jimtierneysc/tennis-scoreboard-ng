# Model for a set in a match
# == Overview
# * A set belongs to a Match
#
# * A set has a state:
#   * +:in_progress+
#   * +:complete+
#
# * A set has a scoring kind
#   * +:eight_game+
#   * +:ten_point+
#   * +:six_game+
#
# +:ten_point+ indicate a match tiebreak set.
# A tiebreak set has only one game
#
# * A set has an ordinal.
# The first set in the match has ordinal 1
#
# * A complete set has a winning team
#
# == Schema Information
#
# Table name: match_sets
#
#  id             :integer          not null, primary key
#  match_id       :integer          not null
#  ordinal        :integer          not null
#  created_at     :datetime         not null
#  updated_at     :datetime         not null
#  scoring        :string           not null
#  team_winner_id :integer
#

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

  # Indicate whether the match has a winner
  # * *Returns* : Boolean
  def completed?
    team_winner
  end

  # Get the state of the match
  # * *Returns* : state
  #   * +:in_progress+
  #   * +:complete+
  def state
    if completed?
      :complete
    else
      :in_progress
    end
  end

  # Compute the winner of the set, if any, based
  # on the games won and the scoring kind
  # * *Returns* : Team or nil
  def compute_team_winner
    if completed?
      team_winner
    else
      lookup = lookup_games_won
      # pass games won by each team
      calc_winner_team(lookup[match.first_team_id][0],
                       lookup[match.second_team_id][0])
    end
  end

  # Indicate whether a team can win the set if the team
  # wins one more game
  # * *Args*    :
  #   - +team+ -> Team
  # * *Returns* : Boolean
  def near_team_winner?(team)
    unless completed?
      lookup = lookup_games_won
      first_won = lookup[match.first_team_id][0]
      second_won = lookup[match.second_team_id][0]
      first_won += 1 if team.id == match.first_team_id
      second_won += 1 if team.id == match.second_team_id
      calc_winner_team(first_won, second_won)
    end
  end

  # Get the last game of the set
  # * *Returns* : Game
  def last_game
    set_games.last
  end

  # Get the minimum number of games that an opponent
  # must win in order to win the set, based on the scoring
  # kind.
  # * *Returns* : count
  def win_threshold
    case scoring.to_sym
    when :eight_game
      8
    when :ten_point
      1
    else # :six_game
      6
    end
  end

  # Indicate if this set is a match tiebreak
  # * *Returns* : Boolean
  def tiebreak?
    scoring.to_sym == :ten_point
  end

  # Indicate whether a particular game is a tiebreak.
  # A game may be a tiebreak because the set is tied
  # (e.g. 6-6), or because the set is a match tiebreak.
  # * *Args*    :
  #   - +game_ordinal+ -> ordinal
  # * *Returns* : Boolean
  def tiebreak_game?(game_ordinal)
    tiebreak_ordinal = (win_threshold == 1) ? 1 : win_threshold * 2 + 1
    game_ordinal == tiebreak_ordinal
  end

  # Clear cached scores.  For internal use.
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
    win_tiebreak = minmax == [threshold, threshold + 1]
    win_by_two || win_tiebreak
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
