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
    .factory('authHelper', helperFunc);

  /** @ngInject */
  function helperFunc($log, authenticationService) {
    var service = {
      activate: activateFunc
    };
    return service;

    function activateFunc(vm, scope) {
      // Initialize controller
      vm.loggedIn = authenticationService.loggedIn;
      vm.userName = authenticationService.userName;
      vm.logOut = logOut;
      var helper = new AuthHelper(vm);
      authenticationService.subscribeChanged(scope, helper.changed);
    }

    function logOut() {
      authenticationService.clearCredentials();
    }

    function AuthHelper(_vm_) {
      var helper = this;
      helper.vm = _vm_;
      helper.changed = changed;

      function changed() {
        helper.vm.loggedIn = authenticationService.loggedIn;
        helper.vm.userName = authenticationService.userName;
      }

    }

  }
})();




