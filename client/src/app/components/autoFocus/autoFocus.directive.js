/**
 * @ngdoc directive
 * @name feAutoFocus
 * @description
 * Set focus to an HTML element
 *
 */

(function () {
  'use strict';

  angular
    .module('frontendComponents')
    .directive('feAutoFocus', directive);

  /** @ngInject */
  function directive($timeout) {
    return {
      restrict: 'A',
      link: function (scope, element, attr) {
        if (attr.feAutoFocus) {
          // fe-auto-focus has a value, so wait for event.
          scope.$on('fe-autoFocus', function (e, name) {
            if (name === attr.feAutoFocus) {
              setFocus();
            }
          });
        }
        else {
          // fe-auto-focus does not have a value, so focus when linked.
          var timer = $timeout(function () {
            setFocus();
          }, 1);
          scope.$on('$destroy', function () {
              $timeout.cancel(timer);
            }
          );
        }

        function setFocus() {
          if (angular.isDefined(scope.autoFocused)) {
            // Indicate that focus was set
            scope.autoFocused = element[0].name; 
          }
          element[0].focus();
        }
      }
    }
  }
})();

