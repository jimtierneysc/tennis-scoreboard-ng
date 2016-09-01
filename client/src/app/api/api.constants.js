/**
 * @ngdoc object
 * @name app.api.constant:apiConstants 
 * @description
 *
 * # app.api constants
 *
 * Constants declaring the paths and header names to use when making REST API requests.
 */
(function() {
  'use strict';

  angular
    .module('app.api')
    .constant('apiPath','/api/')
    .constant('sessionsPath', 'sessions')
    .constant('userPath', 'user')
    .constant('playersPath', 'players')
    .constant('teamsPath', 'teams')
    .constant('matchesPath', 'matches')
    .constant('scoreboardPath', 'match_scoreboard')
    .constant('authHeaderName', 'Authorization');

})();
