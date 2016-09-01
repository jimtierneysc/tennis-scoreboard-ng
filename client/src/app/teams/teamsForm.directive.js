/**
 * @ngdoc directive
 * @name app.teams.directive:feTeamsForm
 * @restrict E
 * @description
 * Form for adding a new team or editing an existing team.
 * The form has the following fields:
 * * name
 * * first player
 * * second player
 *
 */

(function () {
  'use strict';

  angular
    .module('app.teams')
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
