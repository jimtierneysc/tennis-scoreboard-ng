module PlayActions

  def all_actions
    [
      :start_play,
      :restart_play,
      :discard_play,
      :complete_play,
      :start_set,
      :complete_set_play,
      :start_game,
      :start_tiebreaker,
      :remove_last_change,
      :start_match_tiebreaker,
      :complete_match_tiebreaker,
      :win_game,
      :win_tiebreaker,
      :win_match_tiebreaker
    ]
  end

  def first_actions
    [
      :start_play,
    ]
  end

  def win_actions
    [
      :win_game,
      :win_tiebreaker,
      :win_match_tiebreaker
    ]
  end

end

RSpec.configure do |c|
  c.extend PlayActions, play_actions: true
end