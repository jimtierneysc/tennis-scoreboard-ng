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
  function factory($log, userCredentials, editInProgress, authHttpInterceptor) {

    return activate;

    // Initialize controller
    function activate(vm, scope, loggedInChanged) {
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
        if (loggedInChanged) {
          // Controller can be notified by implementing loggedInChanged()
          loggedInChanged();
        }
      });

      // Clear credentials on 403 error
      authHttpInterceptor.subscribeUnauthorized(scope, function () {
        $log.error('unauthorized');
        userCredentials.clearCredentials();
      });
    }
  }
})();




