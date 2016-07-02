/**
 * @ngdoc factory
 * @name authHelper
 * @description
 * Common functionality shared by CRUD controllers
 *
 */
(function () {
  'use strict';

  angular
    .module('frontend')
    .factory('authHelper', factory);

  /** @ngInject */
  function factory($log, authenticationService) {
    var service = {
      activate: activate
    };
    return service;

    function activate(vm, scope) {
      // Initialize controller
      vm.loggedIn = authenticationService.loggedIn;
      vm.userName = authenticationService.userName;
      vm.logOut = logOut;
      vm.supportsAuth = true;
      var watcher = new AuthWatcher(vm);
      authenticationService.subscribeChanged(scope, watcher.changed);
    }

    function logOut() {
      authenticationService.clearCredentials();
    }

    function AuthWatcher(_vm_) {
      var watcher = this;
      watcher.vm = _vm_;
      watcher.changed = changed;

      function changed() {
        watcher.vm.loggedIn = authenticationService.loggedIn;
        watcher.vm.userName = authenticationService.userName;
      }
    }
  }
})();




