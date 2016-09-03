/**
 * @ngdoc service
 * @name app.auth.authHelper
 * @description
 * Add authorization functionality to a controller
 *
 */
(function () {
  'use strict';

  angular
    .module('app.auth')
    .factory('authHelper', factory);

  /** @ngInject */
  function factory($log, userCredentials, editInProgress, authHttpInterceptor) {

    return activate;

    /**
     * @ngdoc function
     * @name activate
     * @methodOf app.auth.authHelper
     * @description
     * Add members to a controller:
     * * loggedIn
     * * username
     * * logOut()
     *
     * @param {Object} vm
     * Controller instance
     * @param {Object} scope
     * Controller scope
     * @param {Function} loggedInChanged
     * Callback when login or logout
     */
    function activate(vm, scope, loggedInChanged) {
      vm.loggedIn = userCredentials.loggedIn;
      vm.username = userCredentials.username;
      vm.logOut = function () {
        // Cancel pending edits, if any
        editInProgress.closeEditors().then(
          userCredentials.clearCredentials)
      };

      userCredentials.subscribeChanged(scope, function () {
        vm.loggedIn = userCredentials.loggedIn;
        vm.username = userCredentials.username;
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




