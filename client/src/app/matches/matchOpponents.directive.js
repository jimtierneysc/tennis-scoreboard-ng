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
    .module('frontend')
    .directive('feMatchOpponents', directiveFunc);

  /** @ngInject */
  function directiveFunc($log) {
    var directive = {
      restrict: 'EA',
      templateUrl: 'app/matches/matchOpponents.html',
      scope: {
        match: '='
      }
    };

    return directive;
  }

})();
