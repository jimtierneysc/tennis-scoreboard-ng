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
  function Controller($log, $scope, crudHelper, authHelper, playersResource, response) {
    
    var vm = this;

    activate();

    function activate() {
      authHelper(vm, $scope);
      crudHelper(vm,
        {
          response: response,
          resourceName: playersResource,
          prepareToCreateEntity: prepareToCreateEntity,
          prepareToUpdateEntity: prepareToUpdateEntity,
          beforeShowNewEntity: null,
          beforeShowEditEntity: null,
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




