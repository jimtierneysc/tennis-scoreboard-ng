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
    .controller('HeaderController', MainController);

  /** @ngInject */
  function MainController() {
    var vm = this;
    vm.isCollapsed = true;
  }
})();
