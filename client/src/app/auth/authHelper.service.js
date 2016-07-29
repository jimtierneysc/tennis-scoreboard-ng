/**
 * @ngdoc factory
 * @name authHelper
 * @description
 * Add authentication functionality to a controller
 *
 */
(function () {
  'use strict';

  angular
    .module('frontendAuth')
    .factory('authHelper', factory);

  /** @ngInject */
  function factory($log, userCredentials, editInProgress, authInterceptor) {

    return activate;

    function activate(vm, scope) {
      // Initialize controller
      vm.loggedIn = userCredentials.loggedIn;
      vm.userName = userCredentials.userName;
      vm.logOut = function () {
        // Cancel pending edits, if any
        editInProgress.closeEditors().then(
          userCredentials.clearCredentials)
      };
      userCredentials.subscribeChanged(scope, function () {
        vm.loggedIn = userCredentials.loggedIn;
        vm.userName = userCredentials.userName;
      });

      authInterceptor.subscribeUnauthorized(scope, function () {
        $log.error('unauthorized');
        userCredentials.clearCredentials();
      });
    }
  }
})();




