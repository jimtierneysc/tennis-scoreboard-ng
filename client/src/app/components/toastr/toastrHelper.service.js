/**
 * @ngdoc service
 * @name app.components.toastrHelper
 * @description
 * Adds popup toast functionality to a controller
 *
 */
(function () {
  'use strict';

  angular
    .module('app.components')
    .factory('toastrHelper', factory);

  /** @ngInject */
  function factory(toastr) {
    return activate;

    /**
     * @ngdoc function
     * @name activate
     * @methodOf app.components.toastrHelper
     * @description
     * Adds members to a controller:
     * * showToast()
     * * showHttpErrorToast()
     * * clearToast()
     * * lastToast
     *
     * @param {Object} _vm_
     * Controller instance
     * @param {Object} _scope_
     * Controller scope
     */
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
        var result = status == 401;
        if (result)
          vm.showToast('Please login again.', "Authorization is no longer valid");
        return result;
      }

      function clearToast() {
        toastr.clear();
        vm.lastToast = null;
      }
    }
  }
})();




