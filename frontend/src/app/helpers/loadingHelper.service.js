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
    .factory('loadingHelper', helperFunc);

  /** @ngInject */
  function helperFunc($log) {
    var service = {
      activate: activateFunc
    };

    var vm = null;
    return service;

    function activateFunc(_vm_) {
      vm = _vm_;
      vm.loadingHasCompleted = loadingHasCompleted;
      vm.loadingHasFailed = loadingHasFailed;
      vm.loading = true;
      vm.loadingMessage = 'Loading...';
      vm.loadingFailed = false;
      vm.loadingFailedMessage = null;
    }
    
    function loadingHasFailed(response, message) {
      vm.loading = false;
      vm.loadingFailed = true;
      if (angular.isUndefined(message))
        vm.loadingFailedMessage = 'Page cannot be displayed because the data could not be retrieved (' + response.statusText + ').  Please check your internet connection.';
      else
        vm.loadingFailedMessage = message;
    }

    function loadingHasCompleted() {
      vm.loading = false;
      vm.loadingFailed = false;
    }
  }
})();




