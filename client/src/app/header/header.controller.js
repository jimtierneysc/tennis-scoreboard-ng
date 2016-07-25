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
    .module('frontend-header')
    .controller('HeaderController', Controller);

  /** @ngInject */
  function Controller(authHelper, $scope, autoFocus, editInProgress) {
    var vm = this;

    activate();

    function activate() {
      vm.isCollapsed = true;
      vm.createLoginForm = true;
      vm.showingLogin = showingLogin;
      vm.showLogin = showLogin;

      authHelper(vm, $scope);

      editInProgress.registerOnCloseRejected($scope,
        function() {
          // e.g.; close responsive drop down if statechange or logout is cancelled
          vm.isCollapsed = true;
        });
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

