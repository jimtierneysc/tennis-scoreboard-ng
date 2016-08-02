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
    .module('frontendHelpers')
    .factory('toastrHelper', factory);

  /** @ngInject */
  function factory($log, toastr) {
    return activate;

    function activate(_vm_, _scope_) {
      var vm = _vm_;
      vm.showToast = showToast;
      vm.showHttpErrorToast = showHttpErrorToast;
      vm.clearToast = clearToast;
      vm.lastToast = null;

      _scope_.$on('$destroy', function () {
        // Remove current toasts when switch views
        clearToast();
      });

      function showToast(message, caption, kind) {
        kind = kind || 'info';
        if (angular.isUndefined(caption))
          caption = kind.charAt(0).toUpperCase() + kind.slice(1);

        toastr.clear();
        vm.lastToast = toastr[kind](message, caption);
      }

      function showHttpErrorToast(status) {
        var result = status == 403;
        if (result)
          vm.showToast('Please login again.', "Authentication no longer valid");
        return result;
      }

      function clearToast() {
        toastr.clear();
        vm.lastToast = null;
      }

    }

  }
})();




