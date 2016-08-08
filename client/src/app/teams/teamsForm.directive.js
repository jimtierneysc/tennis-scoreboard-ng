/**
 * @ngdoc directive
 * @name feTeamsForm
 * @description
 * Form for new player and editing player
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
        form: '=',
        errors: '=',
        cancel: '&',
        submit: '&',
        entity: '=',
        ok: '@',
        playersList: '='
      }
    };

    return directive;
  }
})();
