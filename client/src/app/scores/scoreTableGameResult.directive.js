/**
 * @ngdoc directive
 * @name app.scores.directive:feScoreTableGameResult
 * @restrict E
 * @description
 * Display a check mark to indicate the winner of a game
 */


(function () {
  'use strict';

  angular
    .module('app.scores')
    .directive('feScoreTableGameResult', directive);

  /** @ngInject */
  function directive() {
    var directive = {
      restrict: 'E',
      templateUrl: 'app/scores/scoreTableGameResult.html',
      scope: {
        leftmost: '=',
        view: '=',
        game: '=',
        scores: '='
      }
    };

    return directive;
  }

})();
