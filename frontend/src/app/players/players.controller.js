/**
 * @ngdoc controller
 * @name PlayerController
 * @description
 * Controller for displaying and editing players
 *
 */
(function () {
  'use strict';

  angular
    .module('frontend')
    .controller('PlayerController', MainController);

  /** @ngInject */
  function MainController(playersResource, $log, $scope, crudHelper) {


    var vm = this;
    // vm.playerOptionsList = null;

    crudHelper.activate(vm,
      {
        getResources: playersResource.getPlayers,
        beforeSubmitNewEntity: beforeSubmitNewEntity,
        beforeSubmitEditEntity: beforeSubmitEditEntity,
        beforeShowNewEntityForm: beforeShowNewEntityForm,
        beforeShowEditEntityForm: beforeShowEditEntityForm,
        getEntityDisplayName: getEntityDisplayName,
        makeEntityBody: makeEntityBody,
        scope: $scope,
        entityFieldMap: {
          'name': null
        }
      }
    );

    return vm;


    function beforeSubmitNewEntity(newEntity) {
      // Nothing to do. yet.
    }

    function beforeSubmitEditEntity(newEntity) {
      // Nothing to do. yet.
    }

    function beforeShowNewEntityForm() {
      // Nothing to do. yet.
    }

    function beforeShowEditEntityForm() {
      // Nothing to do. yet.
    }

    function getEntityDisplayName(entity) {
      // TODO: build team name
      return entity.name;
    }

    function makeEntityBody(entity) {
      return {player: entity};
    }
    

  }
})();




