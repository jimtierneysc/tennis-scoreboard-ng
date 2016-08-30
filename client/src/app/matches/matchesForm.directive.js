/**
 * @ngdoc directive
 * @name frontendMatches:feMatchesForm
 * @restrict E
 * @description
 * Form for adding a new match and editing an existing match
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
