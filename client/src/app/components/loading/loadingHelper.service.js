/**
 * @ngdoc service
 * @name app.components.loadingHelper
 * @description
 * Adds loading functionality to a controller
 *
 */
(function () {
  'use strict';

  angular
    .module('app.components')
    .factory('loadingHelper', factory);

  /** @ngInject */
  function factory() {
    return activate;

    /**
     * @ngdoc function
     * @name activate
     * @methodOf app.components.loadingHelper
     * @description
     * Adds members to a controller:
     * * loading.loading
     * * loading.failed
     * * loading.error
     * * loading.hasFailed()
     * * loading.hasCompleted()
     *
     * @param {Object} vm
     * Controller instance
     */
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




