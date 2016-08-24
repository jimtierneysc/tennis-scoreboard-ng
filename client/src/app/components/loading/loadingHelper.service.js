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
    .module('frontendComponents')
    .factory('loadingHelper', factory);

  /** @ngInject */
  function factory() {
    return activate;

    function activate(vm) {
      vm.loading = {
        loading: true,
        failed: false,
        error: null
      };
      vm.loading.hasCompleted = function () {
        vm.loading.loading = false;
        vm.loading.failed = false;
        vm.error = null;
      };
      vm.loading.hasFailed = function (response) {
        vm.loading.loading = false;
        vm.loading.failed = true;
        vm.loading.error = {
          statusText: response.statusText,
          status: response.status,
          data: response.data
        };
      };
    }
  }
})();




