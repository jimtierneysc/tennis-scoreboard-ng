/**
 * @ngdoc directive
 * @name app.teams.directive:feTeamPlayerNames
 * @restrict E
 * @description
 * Display the names of the two players on a team
 *
 */

(function () {
  'use strict';

  angular
    .module('app.teams')
    .directive('feTeamPlayerNames', directiveFunc);

  /** @ngInject */
  function directiveFunc() {
    var directive = {
      restrict: 'E',
      templateUrl: 'app/teams/teamPlayerNames.html',
      scope: {
        team: '=',
        shortPlayerNames: '@',
        punctuation: '@'
      }
    };

    return directive;
  }


})();
