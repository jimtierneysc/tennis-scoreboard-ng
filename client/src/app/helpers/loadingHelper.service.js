/**
 * @ngdoc factory
 * @name loadingHelper
 * @description
 * Adds loading functionality to a controller
 *
 */
(function () {
  'use strict';

  angular
    .module('frontendHelpers')
    .factory('loadingHelper', factory);

  /** @ngInject */
  function factory() {
    return activate;

    function activate(vm) {
      // var helper = new Helper(vm);
      vm.loading = true;
      vm.loadingFailed = false;
      vm.loadingError = null;
      vm.loadingHasCompleted =  function () {
        vm.loading = false;
        vm.loadingFailed = false;
        vm.loadingError = null;
      };
      vm.loadingHasFailed = function (response) {
        vm.loading = false;
        vm.loadingFailed = true;
        vm.loadingError = {
          statusText: response.statusText,
          status: response.status,
          data: response.data
        };
      };
    }
  }
})();




