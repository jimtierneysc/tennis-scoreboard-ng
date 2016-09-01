/**
 * @ngdoc directive
 * @name app.scores.directive:feScoreProgress
 * @restrict E
 * @description
 * Score progress messages
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
