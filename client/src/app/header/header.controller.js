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

      authHelper.activate(vm, $scope);
    }

    function showLogin(open) {
      $log.info('showLogin: ' + open);
      vm.createLoginForm = open;
      if (open)
        autoFocus('username')
    }

    function showingLogin(showing) {
      $log.info('showingLogin: ' + showing);
      if (showing)
        vm.createLoginForm = true;
    }

  }
})();

