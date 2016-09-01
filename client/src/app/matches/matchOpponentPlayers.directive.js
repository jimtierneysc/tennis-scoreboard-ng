/**
 * @ngdoc directive
 * @name app.matches.directive:feMatchOpponentPlayers
 * @restrict E
 * @description
 * Display the opponents in a singles match
 *
 */

(function () {
  'use strict';

  angular
    .module('app.matches')
    .directive('feMatchOpponentPlayers', directiveFunc);

  /** @ngInject */
  function directiveFunc() {
    var directive = {
      restrict: 'E',
      templateUrl: 'app/matches/matchOpponentPlayers.html',
      scope: {
        match: '=',
        shortPlayerNames: '@'
      }
    };

    return directive;
  }

  
})();
