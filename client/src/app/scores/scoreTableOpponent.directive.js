/**
 * @ngdoc directive
 * @name app.scores.directive:feScoreTableOpponent
 * @restrict E
 * @description
 * Display an oppponent in the score table heading
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
