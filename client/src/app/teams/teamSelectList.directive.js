/**
 * @ngdoc directive
 * @name app.teams.directive:feTeamSelectList
 * @restrict E
 * @description
 * Display a team select list.  This directive is designed to be 
 * used on a form that selects the teams in a match.
 *
 */

(function () {
  'use strict';

  angular
    .module('app.teams')
    .directive('feTeamSelectList', directiveFunc);

  /** @ngInject */
  function directiveFunc() {
    var directive = {
      restrict: 'E',
      templateUrl: 'app/teams/teamSelectList.html',
      scope: {
        vm: '=',
        teamsList: '=',
        team: '@'
      }
    };

    return directive;
  }


})();
