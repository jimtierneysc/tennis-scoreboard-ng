/**
 * @ngdoc directive
 * @name app.scores.directive:feScoreTableMatchResult
 * @restrict E
 * @description
 * Display the result of a set in the score table
 */


(function () {
  'use strict';

  angular
    .module('app.scores')
    .directive('feScoreTableMatchResult', directive);

  /** @ngInject */
  function directive() {
    var directive = {
      restrict: 'E',
      templateUrl: 'app/scores/scoreTableMatchResult.html',
      scope: {
        leftmost: '=',
        view: '=',
        scores: '='
      }
    };

    return directive;
  }

})();
