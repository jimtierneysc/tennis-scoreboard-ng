/**
 * @ngdoc directive
 * @name feMatchScoring
 * @description
 * Display how match is scored
 *
 * @example:
 * <fe-match-scoring></fe-match-scoring>
 */

(function () {
  'use strict';

  angular
    .module('frontend')
    .directive('feMatchScoring', directiveFunc);

  /** @ngInject */
  function directiveFunc() {
    var directive = {
      restrict: 'EA',
      templateUrl: 'app/matches/matchScoring.html',
      scope: {
        match: '='
      }
    };
    return directive;
  }

})();
