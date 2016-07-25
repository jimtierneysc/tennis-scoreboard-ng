/**
 * @ngdoc directive
 * @name feMatchesForm
 * @description
 * Form for new player and editing player
 *
 * @example:
 <fe-matches-form></fe-matches-form>
 */


(function () {
  'use strict';

  angular
    .module('frontend-matches')
    .directive('feMatchesForm', directiveFunc);

  /** @ngInject */
  function directiveFunc() {
    var directive = {
      restrict: 'E',
      templateUrl: 'app/matches/matchesForm.html',
      scope: {
        form: '=',
        errors: '=',
        cancel: '&',
        submit: '&',
        entity: '=',
        ok: '@',
        teamsList: '=',
        playersList: '='
      }
    };

    return directive;
  }

})();
