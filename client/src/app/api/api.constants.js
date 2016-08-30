/**
 * @ngdoc overview
 * @name frontendApi constants
 * @description
 *
 * # frontendApi constants
 *
 * Paths and header names used to make REST API requests.
 */
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
    .constant('scoreboardPath', 'match_scoreboard')
    .constant('authHeaderName', 'Authorization');

})();
