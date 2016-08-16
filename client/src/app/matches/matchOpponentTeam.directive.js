/**
 * @ngdoc directive
 * @name feMatchOpponentTeam
 * @description
 * Display a team opponent in a match
 *
 */

(function () {
  'use strict';

  angular
    .module('frontendMatches')
    .directive('feMatchOpponentTeam', directiveFunc);

  /** @ngInject */
  function directiveFunc() {
    var directive = {
      restrict: 'E',
      templateUrl: 'app/matches/matchOpponentTeam.html',
      scope: {
        team: '=',
        displayPlayers: '=',
        period: '@'
      }
    };

    return directive;
  }

})();
