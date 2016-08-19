/**
 * @ngdoc directive
 * @name feMatchOpponentTeamPlayers
 * @description
 * Display the players on a team
 *
 */

(function () {
  'use strict';

  angular
    .module('frontendMatches')
    .directive('feMatchOpponentTeamPlayers', directiveFunc);

  /** @ngInject */
  function directiveFunc() {
    var directive = {
      restrict: 'E',
      templateUrl: 'app/matches/matchOpponentTeamPlayers.html',
      scope: {
        team: '=',
        shortPlayerNames: '@',
        punctuation: '@'
      }
    };

    return directive;
  }


})();
