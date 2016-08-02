/**
 * @ngdoc directive
 * @name feMatchOpponents
 * @description
 * Display opponents of a match
 *
 * @example:
 * <fe-match_opponents></fe-match_opponents>
 */

(function () {
  'use strict';

  angular
    .module('frontendMatches')
    .directive('feMatchOpponents', directiveFunc);

  /** @ngInject */
  function directiveFunc() {
    var directive = {
      restrict: 'E',
      templateUrl: 'app/matches/matchOpponents.html',
      scope: {
        match: '='
      }
    };

    return directive;
  }

})();
