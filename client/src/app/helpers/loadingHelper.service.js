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
    .module('frontend')
    .factory('loadingHelper', factory);

  /** @ngInject */
  function factory() {
    return activate;

    function activate(vm) {
      var helper = new Helper(vm);
      vm.updateLoadingCompleted = helper.completed;
      vm.updateLoadingFailed = helper.failed;
      vm.loading = true;
      vm.loadingMessage = 'Loading...';
      vm.loadingFailed = false;
      vm.loadingFailedMessage = null;
    }

    function Helper(_vm_) {
      var helper = this;
      var vm = _vm_;

      helper.failed = function (response) {
        vm.loading = false;
        vm.loadingFailed = true;
        var statusText = response.statusText;
        vm.loadingFailedMessage = 'Page cannot be displayed because ' +
          'the data could not be retrieved (' + statusText + ').';
      }

      helper.completed = function () {
        vm.loading = false;
        vm.loadingFailed = false;
      }
    }
  }
})();




