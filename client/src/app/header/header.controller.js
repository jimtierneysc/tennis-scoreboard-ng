/**
 * @ngdoc controller
 * @name HeaderController
 * @description
 * Manage data required by nav bar
 *
 */
(function () {
  'use strict';

  angular
    .module('frontend')
    .controller('HeaderController', Controller);

  /** @ngInject */
  function Controller(authHelper, $scope, $log, autoFocus) {
    var vm = this;

    activate();

    function activate() {
      vm.isCollapsed = true;
      vm.createLoginForm = true;
      vm.showingLogin = showingLogin;
      vm.showLogin = showLogin;

      authHelper(vm, $scope);
    }

    function showLogin(open) {
      vm.createLoginForm = open;
      if (open)
        autoFocus('username')
    }

    function showingLogin(showing) {
      if (showing)
        vm.createLoginForm = true;
    }

  }
})();

