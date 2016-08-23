/**
 * @ngdoc directive
 * @name feMatchesForm
 * @description
 * Form for new player and editing player
 *
 */


(function () {
  'use strict';

  angular
    .module('frontendMatches')
    .directive('feMatchesForm', directiveFunc);

  /** @ngInject */
  function directiveFunc() {
    var directive = {
      restrict: 'E',
      templateUrl: 'app/matches/matchesForm.html',
      scope: {
        vm: '=',
        teamsList: '=',
        playersList: '='
      }
    };

    return directive;
  }

})();
