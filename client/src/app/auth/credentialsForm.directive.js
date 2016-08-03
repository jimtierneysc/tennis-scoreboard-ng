/**
 * @ngdoc directive
 * @name feCredentialsForm
 * @description
 * Form for login or signup
 */


(function () {
  'use strict';

  angular
    .module('frontendAuth')
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
