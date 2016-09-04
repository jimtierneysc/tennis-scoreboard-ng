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
  function Controller(authHelper, $scope, autoFocus, editInProgress, toastrHelper) {
    var vm = this;

    activate();

    function activate() {
      vm.isCollapsed = true;
      vm.createLoginForm = true;
      vm.showingLogin = showingLogin;
      vm.showLogin = showLogin;
      vm.collapse = collapse;

      // Add toastr support
      toastrHelper(vm, $scope);

      // Add loggedIn property
      authHelper(vm, $scope, loggedInChanged);

      // close responsive drop down if the user is prompted to close an editor
      editInProgress.registerOnConfirmed($scope,
        function () {
          collapse();
        });
    }

    function showLogin(open) {
      vm.clearToast();
      vm.createLoginForm = open;
      if (open)
        autoFocus($scope, 'username')
    }

    function showingLogin(showing) {
      if (showing)
        vm.createLoginForm = true;
    }

    function loggedInChanged(loading) {
      if (!loading) {  // Ignore change during applicaiton load
        // Close menu after login or logout
        collapse();
        // Popup message
        if (vm.loggedIn)
          vm.showToast(
            'Welcome ' + vm.username + '.' +
            '  You can view and modify players, teams and matches.' +
            '  You can also keep score.',
            'You are logged in');
        else
          vm.showToast(
            'You can no longer modify players, teams or matches' +
            ', or keep score.' +
            '  However, you can view all.',
            'You are logged out');
      }

    }

    function collapse() {
      vm.isCollapsed = true;
    }

  }
})();

