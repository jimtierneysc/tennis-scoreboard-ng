/**
 * @ngdoc directive
 * @name feTeamsForm
 * @description
 * Form for new player and editing player
 *
 * @example:
 <fe-teams-form></fe-teams-form>
 */


(function () {
  'use strict';

  angular
    .module('frontend')
    .directive('feTeamsForm', directiveFunc);

  /** @ngInject */
  function directiveFunc($log) {
    var directive = {
      restrict: 'EA',
      templateUrl: 'app/teams/teamsForm.html',
      scope: {
        form: '@',
        errors: '=',
        cancel: '&',
        submit: '&',
        entity: '=',
        ok: '@',
        playerslist: '='
      }
    };

    return directive;
  }

})();
