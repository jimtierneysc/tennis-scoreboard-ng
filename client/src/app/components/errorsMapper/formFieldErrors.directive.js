/**
 * @ngdoc directive
 * @name feFormFieldErrors
 * @restrict E
 * @description
 * Displays error messages in a form
 *
 */

(function () {
  'use strict';

  angular
    .module('frontendComponents')
    .directive('feFormFieldErrors', directiveFunc);

  /** @ngInject */
  function directiveFunc() {
    var directive = {
      restrict: 'E',
      templateUrl: 'app/components/errorsMapper/formFieldErrors.html',
      scope: {
        errors: '=',
        key: '@',
        prefix: '@'
      }
    };

    return directive;
  }
})();
