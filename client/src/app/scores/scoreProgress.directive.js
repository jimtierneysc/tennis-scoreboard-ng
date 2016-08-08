/**
 * @ngdoc directive
 * @name feScoreProgress
 * @description
 * Score progress messages
 *
 */

(function () {
  'use strict';

  angular
    .module('frontendScores')
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
