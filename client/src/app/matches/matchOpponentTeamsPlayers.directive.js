/**
 * @ngdoc directive
 * @name app.matches.directive:feMatchOpponentTeamsPlayers
 * @restrict E
 * @description
 * Display the four players in a doubles match
 *
 */

(function () {
  'use strict';

  angular
    .module('app.matches')
    .directive('feMatchOpponentTeamsPlayers', directiveFunc);

  /** @ngInject */
  function directiveFunc() {
    var directive = {
      restrict: 'E',
      templateUrl: 'app/matches/matchOpponentTeamsPlayers.html',
      scope: {
        match: '=',
        shortPlayerNames: '@'
      }
    };

    return directive;
  }


})();
