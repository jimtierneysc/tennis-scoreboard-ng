/**
 * @ngdoc directive
 * @name app.scores.directive:feScoreTableGameResult
 * @restrict E
 * @description
 * Display the result of a game in the score table
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
