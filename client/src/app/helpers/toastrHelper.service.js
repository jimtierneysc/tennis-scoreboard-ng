/**
 * @ngdoc factory
 * @name toastrHelper
 * @description
 * Adds popup message functionality to a controller
 *
 */
(function () {
  'use strict';

  angular
    .module('frontend')
    .factory('toastrHelper', factory);

  /** @ngInject */
  function factory($log, toastr) {
    return activate;

    function activate(_vm_, _scope_) {
      var vm = _vm_;
      vm.showToastrError = new ShowToastError(vm).showToastrError;
      vm.lastToast = null;

      _scope_.$on('$destroy', function () {
        // Remove current toasts when switch views
        toastr.clear();
        vm.lastToast = null;
      });
    }

    function ShowToastError(_vm_) {
      var vm = _vm_;
      this.showToastrError = showToastrError;

      function showToastrError(message, caption) {
        if (angular.isUndefined(caption))
          caption = 'Error';

        toastr.clear();
        vm.lastToast = toastr.error(message, caption);
      }
    }
  }
})();




