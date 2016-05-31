/**
 * @ngdoc factory
 * @name toastrHelper
 * @description
 * Common controller functionality shared controllers
 *
 */
(function () {
  'use strict';

  /* global _ */
  
  angular
    .module('frontend')
    .factory('toastrHelper', helperFunc);

  /** @ngInject */
  function helperFunc($log, toastr) {
    var service = {
      activate: activateFunc
    };

    var vm = null;
    return service;

    function activateFunc(_vm_, _scope_) {
      vm = _vm_;
      vm.showToastrError = showToastrError;
      vm.lastToast = null;

      _scope_.$on('$destroy', function () {
        $log.log('destroying controller');
        // Remove current toasts when switch views
        toastr.clear();
      });
    }


    function showToastrError(message, caption) {
      if (angular.isUndefined(caption))
        caption = 'Error';

      vm.lastToast = toastr.error(_.escape(message), caption);
    }


  }
})();




