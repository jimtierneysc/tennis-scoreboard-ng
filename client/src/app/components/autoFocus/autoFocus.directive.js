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
    .directive('feAutoFocus', directive)
    .factory('autoFocus', factory);

  /** @ngInject */
  function directive($timeout) {
    return {
      restrict: 'A',
      link: function (scope, element, attr) {
        if (attr.feAutoFocus) {
          // fe-auto-focus has a value.  Wait for notification.
          scope.$on('fe-autoFocus', function (e, name) {
            if (name === attr.feAutoFocus) {
              setFocus();
            }
          });
        }
        else {
          // fe-auto-focus does not have a value.  Focus when linked.
          $timeout(function () {
            setFocus();
          }, 1);
        }

        function setFocus() {
          if (angular.isDefined(scope.autoFocused)) {
            scope.autoFocused = element[0].name; // for testing
          }
          element[0].focus();
        }
      }
    }
  }

  /** @ngInject */
  function factory($timeout, $rootScope) {
    return broadcast;

    function broadcast(name) {
      $timeout(function () {
        $rootScope.$broadcast('fe-autoFocus', name);
      });
    }
  }


})();
