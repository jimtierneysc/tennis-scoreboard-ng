/**
 * @ngdoc directive
 * @name feScoreStatus
 * @restrict E
 * @description
 * Score status messages
 *
 */


(function () {
  'use strict';

  angular
    .module('frontendScores')
    .directive('feScoreTableRowStatus', directive);

  /** @ngInject */
  function directive() {
    var directive = {
      restrict: 'E',
      templateUrl: 'app/scores/scoreTableRowStatus.html',
      scope: {
        scores: '='
      }
    };

    return directive;
  }

})();
