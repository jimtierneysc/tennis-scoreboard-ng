/**
 * @ngdoc directive
 * @name app.components.directive:feFormFieldErrors
 * @restrict E
 * @description
 * Displays error messages, if any, below a form field.
 *
 */

(function () {
  'use strict';

  angular
    .module('app.components')
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
