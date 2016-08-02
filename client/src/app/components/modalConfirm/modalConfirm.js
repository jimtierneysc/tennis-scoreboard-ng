/**
 * @ngdoc factory
 * @name modalConfirm
 * @description
 * Display a confirmation dialog box
 *
 */

(function () {
  'use strict';


  angular
    .module('frontendComponents')
    .factory('modalConfirm', factory);

  var modalSettings = {
    templateUrl: 'app/components/modalConfirm/modalConfirm.html',
    controller: Controller,
    controllerAs: 'vm'
  };
  
  var defaultLabels = {
    text: 'Are you sure?',
    title: 'Confirm',
    ok: 'Yes',
    cancel: 'Cancel'
  };
  
  /** @ngInject */
  function Controller($uibModalInstance, data) {
    var vm = this;
    vm.data = data;
    vm.ok = closeFunc;
    vm.cancel = cancelFunc;

    function closeFunc(closeMessage) {
      $uibModalInstance.close(closeMessage);
    }

    function cancelFunc(dismissMessage) {
      if (angular.isUndefined(dismissMessage)) {
        dismissMessage = 'cancel';
      }
      $uibModalInstance.dismiss(dismissMessage);
    }
  }

  /** @ngInject */
  function factory($uibModal) {

    return {
      confirm: confirm,
      open: open
    };

    function confirm(labels, options) {
      return open(labels, options).result; // promise
    }

    function open(labels, options) {
      var settings = angular.copy(modalSettings);
      angular.extend(settings, options || {});
      settings.resolve = {data: angular.extend({}, defaultLabels, labels || {})};

      return $uibModal.open(settings);
    }
  }

})();

