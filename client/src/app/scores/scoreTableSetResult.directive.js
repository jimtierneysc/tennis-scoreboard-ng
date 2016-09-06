/**
 * @ngdoc directive
 * @name app.scores.directive:feScoreTableSetResult
 * @restrict E
 * @description
 * Display the number of games won in a set by an opponent
 */

(function () {
  'use strict';

  angular
    .module('app.scores')
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
