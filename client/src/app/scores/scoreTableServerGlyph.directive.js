/**
 * @ngdoc directive
 * @name app.scores.directive:feScoreTableServerGlyph
 * @restrict E
 * @description
 * Displays a glyph beside the current server
 */

(function () {
  'use strict';

  angular
    .module('app.scores')
    .directive('feScoreTableServerGlyph', directive);

  /** @ngInject */
  function directive() {
    var directive = {
      restrict: 'E',
      templateUrl: 'app/scores/scoreTableServerGlyph.html',
      scope: {
        scores: '=',
        show: '@',
        leftmost: '@'
      }
    };

    return directive;
  }

})();
