/**
 * @ngdoc directive
 * @name feMatchOpponentTeams
 * @description
 * Display the team opponents in a match
 *
 */

(function () {
  'use strict';

  angular
    .module('frontendMatches')
    .directive('feMatchOpponentTeams', directiveFunc);

  /** @ngInject */
  function directiveFunc() {
    var directive = {
      restrict: 'E',
      templateUrl: 'app/matches/matchOpponentTeams.html',
      scope: {
        match: '='
      }
    };

    return directive;
  }



})();
