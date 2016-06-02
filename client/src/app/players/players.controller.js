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
  function MainController(playersResource, $log, $timeout, $scope, crudHelper, response) {


    var vm = this;

    activate();

    function activate() {
      crudHelper.activate(vm,
        {
          response: response,
          getResources: playersResource.getPlayers,
          beforeSubmitNewEntity: beforeSubmitNewEntity,
          beforeSubmitEditEntity: beforeSubmitEditEntity,
          beforeShowNewEntityForm: beforeShowNewEntityForm,
          beforeShowEditEntityForm: beforeShowEditEntityForm,
          getEntityDisplayName: getEntityDisplayName,
          makeEntityBody: makeEntityBody,
          scope: $scope,
          errorCategories: {
            'name': null
          }
        }
      );
    }
    
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




