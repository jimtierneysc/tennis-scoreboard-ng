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

      // Add loggedIn property
      authHelper(vm, $scope);

      // close responsive drop down if the user is prompted to close an editor
      editInProgress.registerOnConfirmed($scope,
        function () {
          vm.isCollapsed = true;
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

  }
})();

