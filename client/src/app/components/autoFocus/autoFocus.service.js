/**
 * @ngdoc service
 * @name app.components.autoFocus
 * @description
 * Use this service with the feAutoFocus directive to set focus to an element.
 **/

(function () {
  'use strict';

  angular
    .module('app.components')
    .factory('autoFocus', factory);

  /** @ngInject */
  function factory($timeout, $rootScope) {
    return focus;

    /**
     * @ngdoc function
     * @name focus
     * @methodOf app.components.autoFocus
     * @description
     * Set the focus to an element containing an fe-auto-focus attribute.
     *
     * @param {Object} scope
     * Controller scope
     * @param {String} name
     * Value of a fe-auto-focus attribute.
     */
    function focus(scope, name) {
      var timer = $timeout(function () {
        $rootScope.$broadcast('fe-autoFocus', name);
      }, 100);
      scope.$on('$destroy', function () {
          $timeout.cancel(timer);
        }
      );

    }
  }
})();
