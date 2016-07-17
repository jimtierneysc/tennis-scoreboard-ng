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
    .module('frontend')
    .factory('authHelper', factory);

  /** @ngInject */
  function factory($log, userCredentials) {
    
    return activate;

    function activate(vm, scope) {
      // Initialize controller
      vm.loggedIn = userCredentials.loggedIn;
      vm.userName = userCredentials.userName;
      vm.logOut = logOut;
      var watcher = new AuthWatcher(vm);
      userCredentials.subscribeChanged(scope, watcher.changed);
    }

    function logOut() {
      userCredentials.clearCredentials();
    }

    function AuthWatcher(_vm_) {
      var watcher = this;
      watcher.vm = _vm_;
      watcher.changed = changed;

      function changed() {
        watcher.vm.loggedIn = userCredentials.loggedIn;
        watcher.vm.userName = userCredentials.userName;
      }
    }
  }
})();




