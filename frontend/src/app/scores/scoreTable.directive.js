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
  function directiveFunc($log) {
    var directive = {
      restrict: 'EA',
      templateUrl: 'app/scores/scoreTable.html',
      scope: {
        scores: '='
      },
      link: function (scope, elem) {
        $log.info('link');
      }

    };

    return directive;
  }

})();
