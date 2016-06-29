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
    .controller('PlayerController', Controller);

  /** @ngInject */
  function Controller(playersResource, $log, $scope, crudHelper, authHelper, response) {
    
    var vm = this;

    activate();

    function activate() {
      authHelper.activate(vm, $scope);
      crudHelper.activate(vm,
        {
          response: response,
          getResources: playersResource.getPlayers,
          prepareToCreateEntity: prepareToCreateEntity,
          prepareToUpdateEntity: prepareToUpdateEntity,
          beforeshowNewEntity: null,
          beforeshowEditEntity: null,
          getEntityDisplayName: getEntityDisplayName,
          makeEntityBody: makeEntityBody,
          scope: $scope,
          errorCategories: {
            'name': null
          }
        }
      );
    }
    
    function prepareToCreateEntity(entity) {
      return {name: entity.name};
    }

    function prepareToUpdateEntity(entity) {
      return {
        id: entity.id,
        name: entity.name
      };
    }
    
    function getEntityDisplayName(entity) {
      return entity.name;
    }

    function makeEntityBody(entity) {
      return {player: entity};
    }
  }
})();




