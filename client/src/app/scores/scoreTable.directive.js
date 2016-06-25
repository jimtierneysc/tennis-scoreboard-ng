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
    .module('frontend')
    .directive('feScoreTable', directiveFunc);

  /** @ngInject */
  function directiveFunc() {
    var directive = {
      restrict: 'EA',
      templateUrl: 'app/scores/scoreTable.html',
      scope: {
        scores: '=',
        loggedin: '='
      }
    };

    return directive;
  }

})();
