/**
 * @ngdoc directive
 * @name feScoreTableGameResult
 * @description
 * Display the result of a game in the score table
 */


(function () {
  'use strict';

  angular
    .module('frontendScores')
    .directive('feScoreTableGameResult', directive);

  /** @ngInject */
  function directive() {
    var directive = {
      restrict: 'E',
      templateUrl: 'app/scores/scoreTableGameResult.html',
      scope: {
        winner: '=',
        leftmost: '=',
        serviceBreak: '='
      }
    };

    return directive;
  }

})();
