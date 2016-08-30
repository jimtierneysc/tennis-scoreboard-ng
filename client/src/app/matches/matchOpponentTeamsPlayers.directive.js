/**
 * @ngdoc directive
 * @name frontendMatches:feMatchOpponentTeamsPlayers
 * @restrict E
 * @description
 * Display the four players in a doubles match
 *
 */

(function () {
  'use strict';

  angular
    .module('frontendMatches')
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
