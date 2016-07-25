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
    .module('frontend-helpers')
    .factory('toastrHelper', factory);

  /** @ngInject */
  function factory($log, toastr) {
    return activate;

    function activate(_vm_, _scope_) {
      var vm = _vm_;
      vm.showToast = new ShowToast(vm).showToast;
      vm.lastToast = null;

      _scope_.$on('$destroy', function () {
        // Remove current toasts when switch views
        toastr.clear();
        vm.lastToast = null;
      });
    }

    function ShowToast(_vm_) {
      var vm = _vm_;
      this.showToast = showToast;

      // kinds: error, info, success, warning
      function showToast(message, caption, kind) {
        kind = kind || 'error';
        if (angular.isUndefined(caption))
          caption = kind.charAt(0).toUpperCase() + kind.slice(1);

        toastr.clear();
        vm.lastToast = toastr[kind](message, caption);
      }
    }
  }
})();




