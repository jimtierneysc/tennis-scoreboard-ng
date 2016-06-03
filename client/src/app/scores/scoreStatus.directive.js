/**
 * @ngdoc directive
 * @name feScoreStatus
 * @description
 * Score status messages
 *
 * @example:
 <fe-score-status></fe-score-status>
 */


(function () {
  'use strict';

  angular
    .module('frontend')
    .directive('feScoreStatus', directiveFunc);

  /** @ngInject */
  function directiveFunc() {
    var directive = {
      restrict: 'EA',
      templateUrl: 'app/scores/scoreStatus.html',
      scope: {
        scores: '=',
        title: '='
      }
    };

    return directive;
  }

})();
