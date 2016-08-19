/**
 * @ngdoc directive
 * @name feMatchOpponentPlayer
 * @description
 * Display a player opponent in a match
 *
 */

(function () {
  'use strict';

  angular
    .module('frontendMatches')
    .directive('feMatchOpponentPlayer', directiveFunc);

  /** @ngInject */
  function directiveFunc() {
    var directive = {
      restrict: 'E',
      templateUrl: 'app/matches/matchOpponentPlayer.html',
      controller: Controller,
      controllerAs: 'vm',
      bindToController: true,
      scope: {
        player: '=',
        punctuation: '@',
        shortPlayerName: '@'
      }
    };

    return directive;
  }

  function Controller() {
    var vm = this;

    activate();

    function activate() {
      vm.playerName = playerName;
      vm.suffix = suffix;
    }

    function playerName() {
      var player = vm.player;
      var result;
      if (toBool(vm.shortPlayerName) && player.shortName)
        result = player.shortName;
      else
        result = player.name;
      return result;

      // Handle boolean attribute passed as "true" or "false"
      function toBool(value) {
        var result = value;
        if (angular.isString(result))
          result = result === 'true';
        return result;
      }
    }

    function suffix() {
      var punctuation = vm.punctuation || '';
      if (punctuation) {
        var name = playerName();
        if (name && punctuation == '.' && name.charAt(name.length - 1) == '.')
          punctuation = '';
      }
      return punctuation;
    }
  }


})();
