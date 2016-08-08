/**
 * @ngdoc directive
 * @name feMatchStatus
 * @description
 * Display game, set or match winner
 *
 */

(function () {
  'use strict';

  angular
    .module('frontendScores')
    .directive('feScoreProgressWinner', directiveFunc);

  /** @ngInject */
  function directiveFunc() {
    var directive = {
      restrict: 'E',
      templateUrl: 'app/scores/scoreProgressWinner.html',
      scope: {
        scores: '=',
        winner: '='
      }
    };

    return directive;
  }
})();
