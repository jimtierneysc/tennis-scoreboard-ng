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
  function helperFunc() {
    var service = {
      activate: activateFunc
    };
    return service;

    function activateFunc(vm) {
      var helper = new Helper(vm);
      vm.loadingHasCompleted = helper.loadingHasCompleted;
      vm.loadingHasFailed = helper.loadingHasFailed;
      vm.loading = true;
      vm.loadingMessage = 'Loading...';
      vm.loadingFailed = false;
      vm.loadingFailedMessage = null;
    }
    
    function Helper(_vm_) {
      var helper = this;
      var vm = _vm_;
      
      helper.loadingHasFailed = function(response, message) {
        vm.loading = false;
        vm.loadingFailed = true;
        if (angular.isString(message))
          vm.loadingFailedMessage = message;
        else
          vm.loadingFailedMessage = 'Page cannot be displayed because the data could not be retrieved (' + response.statusText + ').  Please check your internet connection.';
      }

      helper.loadingHasCompleted = function() {
        vm.loading = false;
        vm.loadingFailed = false;
      }
    }
  }
})();




