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
    template: '<div class="modal-header"><h3 class="modal-title">{{vm.data.title}}</h3></div>' +
    '<div class="modal-body">{{vm.data.text}}</div>' +
    '<div class="modal-footer">' +
    '<button class="btn btn-primary" ng-click="vm.ok()">{{vm.data.ok}}</button>' +
    '<button class="btn btn-default" ng-click="vm.cancel()">{{vm.data.cancel}}</button>' +
    '</div>',
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

