/**
 * @ngdoc directive
 * @name app.players.directive:fePlayerSelectList
 * @restrict E
 * @description
 * Display a player select list.  This directive is designed to 
 * be used on forms that select the players on a team or the players in 
 * a match.
 */

(function () {
  'use strict';

  angular
    .module('app.players')
    .directive('fePlayerSelectList', directiveFunc);

  /** @ngInject */
  function directiveFunc() {
    var directive = {
      restrict: 'E',
      templateUrl: 'app/players/playerSelectList.html',
      scope: {
        vm: '=',
        playersList: '=',
        player: '@'
      }
    };

    return directive;
  }
})();
