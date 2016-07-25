/**
 * @ngdoc directive
 * @name feCredentialsForm
 * @description
 * Form for login or signup
 *
 * @example:
 <fe-credentials-form></fe-credentials-form>
 */


(function () {
  'use strict';

  angular
    .module('frontend-auth')
    .directive('feCredentialsForm', directiveFunc);

  /** @ngInject */
  function directiveFunc() {
    var directive = {
      restrict: 'E',
      templateUrl: 'app/auth/credentialsForm.html',
      scope: {
        errors: '=',
        submit: '&',
        entity: '=',
        ok: '@'
      }
    };

    return directive;
  }

})();
