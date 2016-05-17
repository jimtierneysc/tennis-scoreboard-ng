/**
 * @ngdoc directive
 * @name feFocusOnShow
 * @description
 * Set focus to element when shown by ng-show or ng-hide
 *
 * @example:
 <input type="text" ng-show="main.showInput" name="input" fe-focus-on-show>
 */


(function () {
  'use strict';

  angular
    .module('frontend')
    .directive('feFocusOnShow', focusOnShow);

  /** @ngInject */
  function focusOnShow($timeout) {
    var WAIT = 250;
    return {
      restrict: 'A',
      link: linkFunc
    }

    function linkFunc(scope, el, attr) {
      if (attr.ngShow) {
        scope.$watch(attr.ngShow, watchFunc);
      }
      else if (attr.ngHide) {
        scope.$watch(attr.ngHide, watchFunc);
      }

      function watchFunc(newValue) {
        if ((attr.ngShow && newValue) || (attr.ngHide && !newValue)) {
          if (angular.isDefined(scope.settingFocus))
            scope.settingFocus = true;
          $timeout(function () {
            el[0].focus();
          }, WAIT);

        }
      }
    }

  }

})();
