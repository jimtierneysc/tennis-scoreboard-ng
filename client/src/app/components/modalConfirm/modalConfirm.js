/**
 * @ngdoc service
 * @name app.components.modalConfirm
 * @description
 * Display a confirmation dialog box
 *
 */

(function () {
  'use strict';
  
  angular
    .module('app.components')
    .factory('modalConfirm', factory);

  var modalSettings = {
    templateUrl: 'app/components/modalConfirm/modalConfirm.html',
    controller: Controller,
    controllerAs: 'vm'
  };

  var defaultLabels = {
    message: 'Are you sure?',
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

    /**
     * @ngdoc function
     * @name confirm
     * @methodOf app.components.modalConfirm
     * @description
     * Show a confirmation dialog box and let caller wait for confirmation
     *
     * @param {Object} customLabels
     * Overrides for HTML content (ok button, cancel button, message, title)
     * @returns {Object} Promise
     * * Resolved when user chooses OK
     * * Rejected when user chooses Cancel
     */
    function confirm(customLabels) {
      return open(customLabels).result; // promise
    }

    /**
     * @ngdoc function
     * @name open
     * @methodOf app.components.modalConfirm
     * @description
     * Create a confirmation dialog box
     *
     * @param {Object} customLabels
     * Overrides 
     * @returns {Object} modal
     */
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

