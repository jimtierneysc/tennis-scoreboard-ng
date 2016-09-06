/**
 * @ngdoc directive
 * @name app.scores.directive:feScoreProgressWinner
 * @restrict E
 * @description
 * 
 * Display game, set or match winner
 *
 */

(function () {
  'use strict';

  angular
    .module('app.scores')
    .directive('feScoreProgressWinner', directiveFunc);

  /** @ngInject */
  function directiveFunc() {
    var directive = {
      restrict: 'E',
      templateUrl: 'app/scores/scoreProgressWinner.html',
      scope: {
        scores: '=',
        winner: '=',
        matchWinner: '@',
        punctuation: '@'
      }
    };

    return directive;
  }
})();
