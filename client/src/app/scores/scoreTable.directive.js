/**
 * @ngdoc directive
 * @name feScoreTable
 * @restrict E
 * @description
 * Table to display match scoring
 *
 */

(function () {
  'use strict';

  angular
    .module('frontendScores')
    .directive('feScoreTable', directive);

  /** @ngInject */
  function directive() {
    var directive = {
      restrict: 'E',
      templateUrl: 'app/scores/scoreTable.html',
      scope: {
        scores: '=',
        view: '='
      }
    };

    return directive;
  }

})();
