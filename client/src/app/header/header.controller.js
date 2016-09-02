/**
 * @ngdoc controller
 * @name app.header.controller:HeaderController
 * @description
 * Controller for navbar (and login form)
 */

(function () {
  'use strict';

  angular
    .module('app.header')
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
      vm.collapse = collapse;

      // Add loggedIn property
      authHelper(vm, $scope, loggedInChanged);

      // close responsive drop down if the user is prompted to close an editor
      editInProgress.registerOnConfirmed($scope,
        function () {
          collapse();
        });
    }

    function showLogin(open) {
      vm.createLoginForm = open;
      if (open)
        autoFocus($scope, 'username')
    }

    function showingLogin(showing) {
      if (showing)
        vm.createLoginForm = true;
    }

    function loggedInChanged() {
      // Close menu after login or logout
      collapse();
    }

    function collapse() {
      vm.isCollapsed = true;
    }

  }
})();

