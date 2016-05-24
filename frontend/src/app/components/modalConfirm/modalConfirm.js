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
    .module('frontend')
    .controller('ModalConfirmController', modalConfirmController)
    .factory('modalConfirm', modalConfirm);


  var modalSettings = {
    templateUrl: 'app/components/modalConfirm/modalConfirm.html',
    controller: 'ModalConfirmController',
    controllerAs: 'vm'
  };


  var defaultLabels = {
    text: 'Are you sure?',
    title: 'Confirm',
    ok: 'Yes',
    cancel: 'Cancel'
  };


  /** @ngInject */
  function modalConfirmController($uibModalInstance, data) {
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
  function modalConfirm($uibModal) {

    return { confirm: confirmFunc };

    function confirmFunc(labels) {
      var settings = angular.copy(modalSettings);
      settings.resolve = {data: angular.extend({}, defaultLabels, labels || {})};

      return $uibModal.open(settings).result;
    }
  }

})();

