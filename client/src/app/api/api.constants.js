(function() {
  'use strict';

  angular
    .module('frontendApi')
    .constant('baseURL','/api/')
    .constant('playersResource', 'players')
    .constant('teamsResource', 'teams')
    .constant('matchesResource', 'matches')
    .constant('scoreboardResource', 'match_score_board')
    .constant('authHeaderName', 'Authorization');

})();
