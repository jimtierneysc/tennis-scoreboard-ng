/**
 * @ngdoc directive
 * @name feMatchOpponentPlayer
 * @description
 * Display a player opponent in a match
 *
 */

(function () {
  'use strict';

  angular
    .module('frontendMatches')
    .directive('feMatchOpponentPlayer', directiveFunc);

  /** @ngInject */
  function directiveFunc() {
    var directive = {
      restrict: 'E',
      templateUrl: 'app/matches/matchOpponentPlayer.html',
      scope: {
        player: '=',
        period: '@'
      }
    };

    return directive;
  }

})();
