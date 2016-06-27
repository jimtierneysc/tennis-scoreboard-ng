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
  function Controller(authHelper, $scope) {
    var vm = this;

    activate();

    function activate() {
      vm.isCollapsed = true;

      authHelper.activate(vm, $scope);
    }
    
  }
})();

