/**
 * @ngdoc directive
 * @name frontendMatches:feMatchOpponents
 * @restrict E
 * @description
 * Display the teams in a doubles match or the players in a singles match.
 *
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
        match: '=',
        shortPlayerNames: '@'
      }
    };

    return directive;
  }

  
})();
