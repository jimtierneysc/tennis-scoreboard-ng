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
      vm.updateLoadingCompleted =  function () {
        vm.loading = false;
        vm.loadingFailed = false;
        vm.loadingError = null;
      };
      vm.updateLoadingFailed = function (response) {
        vm.loading = false;
        vm.loadingFailed = true;
        vm.loadingError = {
          statusText: response.statusText,
          status: response.status,
          data: response.data
        };
      };
    }

    // function Helper(_vm_) {
    //   var helper = this;
    //   var vm = _vm_;
    //
    //   helper.failed = function (response) {
    //     vm.loading = false;
    //     vm.loadingFailed = true;
    //     vm.loadingError = {
    //       statusText: response.statusText,
    //       status: response.status,
    //       data: response.data
    //     };
    //   };
    //
    //   helper.completed = function () {
    //     vm.loading = false;
    //     vm.loadingFailed = false;
    //     vm.loadingError = null;
    //   }
    // }
  }
})();




