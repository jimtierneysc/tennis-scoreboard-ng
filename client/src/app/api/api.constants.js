(function() {
  'use strict';

  angular
    .module("frontend-api")
    .constant("baseURL","/api/")
    .constant("playersResource", "players")
    .constant("teamsResource", "teams")
    .constant("matchesResource", "matches")
    .constant("scoreboardResource", "match_score_board")
  ;

})();
