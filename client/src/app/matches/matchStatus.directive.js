/**
 * @ngdoc directive
 * @name feMatchStatus
 * @description
 * Display status of a match
 *
 * @example:
 * <fe-match_status></fe-match_status>
 */


(function () {
  'use strict';

  angular
    .module('frontend')
    .directive('feMatchStatus', directiveFunc);

  /** @ngInject */
  function directiveFunc($log) {
    var directive = {
      restrict: 'EA',
      templateUrl: 'app/matches/matchStatus.html',
      scope: {
        match: '='
      }
    };

    return directive;
  }

})();
