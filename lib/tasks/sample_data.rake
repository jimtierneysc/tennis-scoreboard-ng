require 'play_match_helper'

# Tasks to manage tennis sample data
namespace :db do
  desc 'Clears data from the database'
  task clear_data: :environment do
    SampleData.new.clear
  end

  desc 'Populates the database with sample data'
  task sample_data: :environment do
    SampleData.new.sample_data
  end
end

# Create and clear tennis sample data, including
# players, doubles teams, and matches
class SampleData
  ONE_TO_ZERO = PlayMatchHelper::FIRST_PLAYER_WIN
  ZERO_TO_ONE = PlayMatchHelper::SECOND_PLAYER_WIN
  TWO_TO_TWO = ONE_TO_ZERO + ZERO_TO_ONE + ONE_TO_ZERO + ZERO_TO_ONE
  SIX_TO_SIX = TWO_TO_TWO * 3
  SEVEN_TO_SIX = SIX_TO_SIX + ONE_TO_ZERO
  SIX_TO_SEVEN = SIX_TO_SIX + ZERO_TO_ONE
  FOUR_TO_FOUR = TWO_TO_TWO * 2
  TWO_TO_ZERO = ONE_TO_ZERO * 2
  ZERO_TO_TWO = ZERO_TO_ONE * 2
  SIX_TO_FOUR = FOUR_TO_FOUR + TWO_TO_ZERO
  FOUR_TO_SIX = FOUR_TO_FOUR + ZERO_TO_TWO

  def clear
    Match.destroy_all
    Team.destroy_all
    Player.destroy_all
    MatchSet.destroy_all
    SetGame.destroy_all
  end

  def sample_data
    player_data = [
      { name: 'Serena' },
      { name: 'Venus' },
      { name: 'Bob B.' },
      { name: 'Mike B.' },
      { name: 'Jamie M.' },
      { name: 'Andy M.' },
      { name: 'Roger' },
      { name: 'John M.' },
      { name: 'Patrick M.' },
      { name: 'Leander Paes' },
      { name: 'Martina Hingis' },
      { name: 'Novak' },
      { name: 'Rafa' },
      { name: 'Lisa Raymond' },
      { name: 'Sania Mirza' }
    ]

    team_data = [
      { name: 'Williams Sisters', p1: 'Serena', p2: 'Venus', doubles: true },
      { name: 'Brian Brothers', p1: 'Mike B.', p2: 'Bob B.', doubles: true },
      { name: 'McEnroe Brothers', p1: 'John M.', p2: 'Patrick M.',
        doubles: true },
      { name: 'Murray Brothers', p1: 'Andy M.', p2: 'Jamie M.', doubles: true },
      { name: 'India', p1: 'Leander Paes', p2: 'Sania Mirza', doubles: true },
      { name: 'Switzerland', p1: 'Roger', p2: 'Martina Hingis', doubles: true },
      { name: nil, p1: 'Mike B.', p2: 'Lisa Raymond', doubles: true }
    ]

    match_data = [
      { title: 'Brothers',
        scoring: :two_six_game_ten_point,
        doubles: true,
        first_team: 'Brian Brothers',
        second_team: 'Murray Brothers',
        scores: [FOUR_TO_SIX, SIX_TO_FOUR, ONE_TO_ZERO]
      },
      { title: nil,
        scoring: :three_six_game,
        doubles: false,
        p1: 'Roger',
        p2: 'Novak',
        scores: [SIX_TO_SEVEN, FOUR_TO_FOUR]
      },
      { title: 'Sisters',
        scoring: :three_six_game,
        doubles: false,
        p1: 'Venus',
        p2: 'Serena',
        scores: [SIX_TO_FOUR]
      },
      { title: 'Olympics Mixed',
        scoring: :two_six_game_ten_point,
        doubles: true,
        first_team: 'Switzerland',
        second_team: 'India'
      }
    ]

    clear
    add_players player_data
    add_teams team_data
    add_matches match_data
  end

  private

  def add_players(player_data)
    player_data.each do |pd|
      p = Player.new pd
      p.save!
    end
  end

  def add_teams(team_data)
    team_data.each do |td|
      t = Team.new td.slice(:name)
      t.first_player = Player.find_by_name! td[:p1]
      t.second_player = Player.find_by_name! td[:p2] if td[:p2]
      t.doubles = td[:doubles]
      t.save!
    end
  end

  def add_matches(match_data)
    match_data.each do |md|
      add_match(md)
    end
  end

  def add_match(match_data)
    m = Match.new
    m.title = match_data[:title]
    m.scoring = match_data[:scoring]
    m.doubles = match_data[:doubles]
    add_opponents(m, match_data)
    m.save!
    scores = match_data[:scores]
    PlayMatchHelper.play_match(m, scores) if scores
    m.change_score! :complete_play if m.change_score? :complete_play
  end

  def add_opponents(match, match_data)
    if match.doubles
      match.first_team = Team.find_by!(name: match_data[:first_team])
      match.second_team = Team.find_by!(name: match_data[:second_team])
    else
      match.first_singles_player = Player.find_by_name! match_data[:p1]
      match.second_singles_player = Player.find_by_name! match_data[:p2]
    end
  end
end
