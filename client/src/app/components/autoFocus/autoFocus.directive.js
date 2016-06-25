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
      restrict: 'AC',
      link: function (_scope, _element) {
        $timeout(function () {
          _element[0].focus();
        }, 10);
      }
    }
  }

})();
