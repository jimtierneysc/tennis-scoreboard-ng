/**
 * @ngdoc directive
 * @name feScoreTableOpponent
 * @description
 * Table heading for opponent
 */


(function () {
  'use strict';

  angular
    .module('frontendScores')
    .directive('feScoreTableOpponent', directive);

  /** @ngInject */
  function directive() {
    var directive = {
      restrict: 'E',
      templateUrl: 'app/scores/scoreTableOpponent.html',
      scope: {
        scores: '=',
        opponent: '=',
        leftmost: '@'
      }
    };

    return directive;
  }

})();
