/**
 * @ngdoc service
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
  function factory($uibModal) {

    return {
      confirm: confirm,
      open: open
    };

    function confirm(labels) {
      return open(labels).result; // promise
    }

    function open(customLabels) {
      var settings = angular.copy(modalSettings);
      settings.resolve = {labels: angular.extend({}, defaultLabels, customLabels || {})};

      return $uibModal.open(settings);
    }
  }

  /** @ngInject */
  function Controller($uibModalInstance, labels) {
    var vm = this;
    vm.labels = labels;
    vm.ok = ok;
    vm.cancel = cancel;

    function ok(closeMessage) {
      $uibModalInstance.close(closeMessage);
    }

    function cancel(dismissMessage) {
      if (angular.isUndefined(dismissMessage)) {
        dismissMessage = 'cancel';
      }
      $uibModalInstance.dismiss(dismissMessage);
    }
  }



})();

