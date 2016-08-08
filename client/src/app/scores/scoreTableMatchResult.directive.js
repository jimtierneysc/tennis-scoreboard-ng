/**
 * @ngdoc directive
 * @name feScoreTableMatchResult
 * @description
 * Display the result of a set in the score table
 */


(function () {
  'use strict';

  angular
    .module('frontendScores')
    .directive('feScoreTableMatchResult', directive);

  /** @ngInject */
  function directive() {
    var directive = {
      restrict: 'E',
      templateUrl: 'app/scores/scoreTableMatchResult.html',
      scope: {
        winner: '=',
        count: '=',
        view: '=',
        scores: '='
      }
    };

    return directive;
  }

})();
