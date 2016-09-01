/**
 * @ngdoc directive
 * @name app.matches.directive:feMatchOpponents
 * @restrict E
 * @description
 * Display the teams in a doubles match or the players in a singles match.
 *
 */

(function () {
  'use strict';

  angular
    .module('app.matches')
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
