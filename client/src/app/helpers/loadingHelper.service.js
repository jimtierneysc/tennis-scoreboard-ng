/**
 * @ngdoc factory
 * @name loadingHelper
 * @description
 * Common controller functionality shared by controllers
 *
 */
(function () {
  'use strict';

  angular
    .module('frontend')
    .factory('loadingHelper', factory);

  /** @ngInject */
  function factory() {
    var service = {
      activate: activate
    };
    return service;

    function activate(vm) {
      var helper = new Helper(vm);
      vm.loadingHasCompleted = helper.loadingHasCompleted;
      vm.loadingHasFailed = helper.loadingHasFailed;
      vm.loading = true;
      vm.loadingMessage = 'Loading...';
      vm.loadingFailed = false;
      vm.loadingFailedMessage = null;
      vm.supportsLoading = true;
    }

    function Helper(_vm_) {
      var helper = this;
      var vm = _vm_;

      helper.loadingHasFailed = function (response) {
        vm.loading = false;
        vm.loadingFailed = true;
        vm.loadingFailedMessage = 'Page cannot be displayed because the data could not be retrieved (' + response.statusText + ').';
      }

      helper.loadingHasCompleted = function () {
        vm.loading = false;
        vm.loadingFailed = false;
      }
    }
  }
})();




