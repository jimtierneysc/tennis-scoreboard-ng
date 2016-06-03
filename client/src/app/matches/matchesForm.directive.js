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
    .module('frontend')
    .directive('feMatchesForm', directiveFunc);

  /** @ngInject */
  function directiveFunc() {
    var directive = {
      restrict: 'EA',
      templateUrl: 'app/matches/matchesForm.html',
      scope: {
        form: '@',
        errors: '=',
        cancel: '&',
        submit: '&',
        entity: '=',
        ok: '@',
        teamslist: '=',
        playerslist: '='
      }
    };

    return directive;
  }

})();
