/**
 * @ngdoc directive
 * @name app.scores.directive:feScoreTableMatchResult
 * @restrict E
 * @description
 * Display the number of sets won by an opponent
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
