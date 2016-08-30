/**
 * @ngdoc directive
 * @name feScoreTableSetResult
 * @restrict E
 * @description
 * Display the result of a set in the score table
 */


(function () {
  'use strict';

  angular
    .module('frontendScores')
    .directive('feScoreTableSetResult', directive);

  /** @ngInject */
  function directive() {
    var directive = {
      restrict: 'E',
      templateUrl: 'app/scores/scoreTableSetResult.html',
      scope: {
        scores: '=',
        view: '=',
        set: '=',
        leftmost: '='
      }
    };

    return directive;
  }

})();
