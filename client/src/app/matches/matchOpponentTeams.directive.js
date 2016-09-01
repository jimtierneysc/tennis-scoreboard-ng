/**
 * @ngdoc directive
 * @name app.matches.directive:feMatchOpponentTeams
 * @restrict E
 * @description
 * Display the teams in a match
 *
 */

(function () {
  'use strict';

  angular
    .module('app.matches')
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
