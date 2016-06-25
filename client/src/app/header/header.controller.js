/**
 * @ngdoc controller
 * @name HeaderController
 * @description
 * Manage data required by nav bar
 *
 */
(function() {
  'use strict';

  angular
    .module('frontend')
    .controller('HeaderController', Controller);

  /** @ngInject */
  function Controller(authHelper, $scope, $state) {
    var vm = this;
    vm.isCollapsed = true;
    vm.loggingIn = loggingIn;

    activate();

    function activate() {
      authHelper.activate(vm, $scope);
    }

    function loggingIn() {
      return  (['login', 'register'].indexOf($state.current.name) >= 0)
    }

  }
})();

