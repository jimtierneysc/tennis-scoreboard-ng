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


    function beforeSubmitNewEntity(entity) {
      return {name: entity.name};
    }

    function beforeSubmitEditEntity(entity) {
      return {
        id: entity.id, 
        name: entity.name 
      };
    }

    function beforeShowNewEntityForm() {
      // Nothing to do. 
    }

    function beforeShowEditEntityForm() {
      // Nothing to do. 
    }

    function getEntityDisplayName(entity) {
      return entity.name;
    }

    function makeEntityBody(entity) {
      return {player: entity};
    }
    

  }
})();




