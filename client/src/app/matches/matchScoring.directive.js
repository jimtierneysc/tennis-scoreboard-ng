/**
 * @ngdoc directive
 * @name frontendMatches:feMatchScoring
 * @restrict E
 * @description
 * Display how the match is scored (e.g.; two sets of six)
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
