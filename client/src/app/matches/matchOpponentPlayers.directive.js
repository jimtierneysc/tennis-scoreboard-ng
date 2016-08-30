/**
 * @ngdoc directive
 * @name frontendMatches:feMatchOpponentPlayers
 * @restrict E
 * @description
 * Display the opponents in a singles match
 *
 */

(function () {
  'use strict';

  angular
    .module('frontendMatches')
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
