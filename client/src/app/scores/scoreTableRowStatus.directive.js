/**
 * @ngdoc directive
 * @name app.scores.directive:feScoreStatus
 * @restrict E
 * @description
 * Score status messages
 *
 */


(function () {
  'use strict';

  angular
    .module('app.scores')
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
