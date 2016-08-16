/**
 * @ngdoc factory
 * @name autoFocus
 * @description
 * Use with feAutoFocus direcitve to set focus after linking
 **/

(function () {
  'use strict';

  angular
    .module('frontendComponents')
    .factory('autoFocus', factory);

  /** @ngInject */
  function factory($timeout, $rootScope) {
    return focus;

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
