/**
 * @ngdoc directive
 * @name app.scores.directive:feScoreTableOpponent
 * @restrict E
 * @description
 * Table heading for opponent
 */

(function () {
  'use strict';

  angular
    .module('app.scores')
    .directive('feScoreTableOpponent', directive);

  /** @ngInject */
  function directive() {
    var directive = {
      restrict: 'E',
      templateUrl: 'app/scores/scoreTableOpponent.html',
      scope: {
        scores: '=',
        opponent: '=',
        leftmost: '@',
        view: '='
      }
    };

    return directive;
  }

})();
