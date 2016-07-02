(function() {
  'use strict';

  angular
    .module("frontend")
    .constant("baseURL","/api/")
    .constant("playersResource", "players")
    .constant("teamsResource", "teams")
    .constant("matchesResource", "matches")
    .constant("scoreboardResource", "match_score_board")
  ;

})();
