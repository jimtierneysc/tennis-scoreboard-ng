/**
 * @ngdoc directive
 * @name app.matches.directive:feMatchesForm
 * @restrict E
 * @description
 * Form for adding a new match or editing an existing match.  The form has the following fields:
 * * title
 * * doubles radio button
 * * singles radio button
 * * first player name xor first team name
 * * second player name xor second team name
 * * scoring radio buttons
 */

(function () {
  'use strict';

  angular
    .module('app.matches')
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
