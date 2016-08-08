/**
 * @ngdoc directive
 * @name feMatchScoring
 * @description
 * Display how match is scored
 *
 */

(function () {
  'use strict';

  angular
    .module('frontendMatches')
    .directive('feMatchScoring', directiveFunc);

  /** @ngInject */
  function directiveFunc() {
    var directive = {
      restrict: 'E',
      templateUrl: 'app/matches/matchScoring.html',
      scope: {
        match: '='
      }
    };
    return directive;
  }

})();
