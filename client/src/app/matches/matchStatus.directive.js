/**
 * @ngdoc directive
 * @name feMatchStatus
 * @description
 * Display status of a match
 *
 */

(function () {
  'use strict';

  angular
    .module('frontendMatches')
    .directive('feMatchStatus', directiveFunc);

  /** @ngInject */
  function directiveFunc() {
    var directive = {
      restrict: 'E',
      templateUrl: 'app/matches/matchStatus.html',
      scope: {
        match: '='
      }
    };

    return directive;
  }
})();
