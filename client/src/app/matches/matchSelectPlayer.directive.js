/**
 * @ngdoc directive
 * @name app.matches.directive:feMatchSelectPlayer
 * @restrict E
 * @description
 * Display a player select list
 *
 */

(function () {
  'use strict';

  angular
    .module('app.matches')
    .directive('feMatchSelectPlayer', directiveFunc);

  /** @ngInject */
  function directiveFunc() {
    var directive = {
      restrict: 'E',
      templateUrl: 'app/matches/matchSelectPlayer.html',
      scope: {
        vm: '=',
        playersList: '=',
        player: '@'
      }
    };

    return directive;
  }


})();
