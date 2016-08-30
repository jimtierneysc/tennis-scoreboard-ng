/**
 * @ngdoc directive
 * @name frontendMatches:feMatchOpponentTeam
 * @restrict E
 * @description
 * Display the name of a team in a match
 *
 */

(function () {
  'use strict';

  angular
    .module('frontendMatches')
    .directive('feMatchOpponentTeam', directiveFunc);

  /** @ngInject */
  function directiveFunc() {
    var directive = {
      restrict: 'E',
      templateUrl: 'app/matches/matchOpponentTeam.html',
      controller: Controller,
      controllerAs: 'vm',
      bindToController: true,
      scope: {
        team: '=',
        punctuation: '@'
      }
    };

    return directive;
  }

  function Controller() {
    var vm = this;

    activate();

    function activate() {
      vm.teamName = teamName;
      vm.suffix = suffix;
    }

    function teamName() {
      var result = vm.team.name;
      if (!result) result = 'Unnamed team';
      return result;
    }
    
    function suffix() {
      var punctuation = vm.punctuation || '';
      if (punctuation) {
        var name = teamName();
        if (name && punctuation == '.' && name.charAt(name.length - 1) == '.')
          punctuation = '';
      }
      return punctuation;
    }

  }


})();
