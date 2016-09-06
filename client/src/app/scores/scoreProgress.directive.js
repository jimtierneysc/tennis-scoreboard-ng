/**
 * @ngdoc directive
 * @name app.scores.directive:feScoreProgress
 * @restrict E
 * @description
 * Describing the progress of the match.  This may include
 * the number of the current game, the name of the most recent game winner,
 * or the name of the match winner.
 *
 */

(function () {
  'use strict';

  angular
    .module('app.scores')
    .directive('feScoreProgress', directive);

  /** @ngInject */
  function directive() {
    var directive = {
      restrict: 'E',
      templateUrl: 'app/scores/scoreProgress.html',
      scope: {
        scores: '=',
        view: '='
      }
    };

    return directive;
  }

})();
