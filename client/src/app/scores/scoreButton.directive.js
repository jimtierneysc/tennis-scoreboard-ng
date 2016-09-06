/**
 * @ngdoc directive
 * @name app.scores.directive:feScoreButton
 * @restrict E
 * @description
 * Button to execute an action such as
 * start_game, start_tiebreaker, win_game, win_tiebreaker, etc.
 *
 */


(function () {
  'use strict';

  angular
    .module('app.scores')
    .directive('feScoreButton', directiveFunc);

  /** @ngInject */
  function directiveFunc() {
    var directive = {
      restrict: 'E',
      templateUrl: 'app/scores/scoreButton.html',
      scope: {
        scores: '=',
        param: '=',
        view: '='
      }
    };

    return directive;
  }

})();
