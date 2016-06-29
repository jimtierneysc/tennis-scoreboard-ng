/**
 * @ngdoc directive
 * @name feAutoFocus
 * @description
 * Set focus to element
 *
 * @example:
 * <input type="text" fe-auto-focus>
 */

(function () {
  'use strict';

  angular
    .module('frontend')
    .directive('feAutoFocus', autoFocus);

  /** @ngInject */
  function autoFocus($timeout) {
    return {
      restrict: 'A',
      link: function (scope, element) {
        $timeout(function () {
          if (angular.isDefined(scope.autoFocused)) {
            scope.autoFocused = element[0].name; // for testing
          }
          element[0].focus();
        }, 10);
      }
    }
  }

})();
