/**
 * @ngdoc directive
 * @name frontendTeams:feTeamsForm
 * @restrict E
 * @description
 * Form for adding a new team and editing an existing team
 *
 */

(function () {
  'use strict';

  angular
    .module('frontendTeams')
    .directive('feTeamsForm', directive);

  /** @ngInject */
  function directive() {
    var directive = {
      restrict: 'E',
      templateUrl: 'app/teams/teamsForm.html',
      scope: {
        vm: '=',
        playersList: '='
      }
    };

    return directive;
  }
})();
