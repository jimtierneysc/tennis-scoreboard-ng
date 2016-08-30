/**
 * @ngdoc directive
 * @name feScoreTableServerGlyph
 * @restrict E
 * @description
 * Displays a glyph beside the current server
 */

(function () {
  'use strict';

  angular
    .module('frontendScores')
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
