/**
 * @ngdoc directive
 * @name app.matches.directive:feMatchScoring
 * @restrict E
 * @description
 * Display how the match is scored (e.g.; two sets of six)
 *
 */

(function () {
  'use strict';

  angular
    .module('app.matches')
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
