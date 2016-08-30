/**
 * @ngdoc directive
 * @name frontendMatches:feMatchOpponentTeams
 * @restrict E
 * @description
 * Display the teams in a match
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
