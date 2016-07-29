/**
 * @ngdoc directive
 * @name feScoreTable
 * @description
 * Table to display match scoring
 *
 * @example:
 <fe-score-table></fe-score-table>
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
        view: '=',
        loggedin: '='
      }
    };

    return directive;
  }

})();
