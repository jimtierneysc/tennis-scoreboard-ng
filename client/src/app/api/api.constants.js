(function() {
  'use strict';

  angular
    .module('frontendApi')
    .constant('apiPath','/api/')
    .constant('sessionsPath', 'sessions')
    .constant('userPath', 'user')
    .constant('playersPath', 'players')
    .constant('teamsPath', 'teams')
    .constant('matchesPath', 'matches')
    .constant('scoreboardPath', 'match_score_board')
    .constant('authHeaderName', 'Authorization');

})();
