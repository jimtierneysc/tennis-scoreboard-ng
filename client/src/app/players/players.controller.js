/**
 * @ngdoc controller
 * @name PlayersController
 * @description
 * Controller for displaying and editing players
 *
 */

(function () {
  'use strict';

  angular
    .module('frontend-players')
    .controller('PlayersController', Controller);

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
          entityKind: 'Player',
          errorsMap: {
            names: [
              'name'
            ]
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




