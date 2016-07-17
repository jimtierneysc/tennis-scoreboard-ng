/**
 * @ngdoc directive
 * @name fePlayersForm
 * @description
 * Form for new player and edit player
 *
 * @example:
 <fe-players-form></fe-players-form>
 */


(function () {
  'use strict';

  angular
    .module('frontend')
    .directive('fePlayersForm', directiveFunc);

  /** @ngInject */
  function directiveFunc() {
    var directive = {
      restrict: 'E',
      templateUrl: 'app/players/playersForm.html',
      scope: {
        form: '@',
        errors: '=',
        cancel: '&',
        submit: '&',
        entity: '=',
        ok: '@'
      }
    };

    return directive;
  }

})();
