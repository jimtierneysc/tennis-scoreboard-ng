/**
 * @ngdoc controller
 * @name frontendPlayers:PlayersController
 * @description
 * Controller for displaying and editing players
 */

(function () {
  'use strict';

  angular
    .module('frontendPlayers')
    .controller('PlayersController', Controller);

  /** @ngInject */
  function Controller($log, $scope, crudHelper, authHelper, playersPath, response, $q) {

    var vm = this;

    activate();

    /**
     * @ngdoc function
     * @name activate
     * @methodOf frontendPlayers:PlayersController
     * @description
     * Initialize the controller:
     * * Call the crudHelper service with player-specific options.
     */
    function activate() {
      // authHelper(vm, $scope);
      crudHelper(vm,
        {
          response: response,
          resourceName: playersPath,
          prepareToCreateEntity: prepareToCreateEntity,
          prepareToUpdateEntity: prepareToUpdateEntity,
          beforeShowNewEntity: resolvedPromise,
          beforeShowEditEntity: resolvedPromise,
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

    function resolvedPromise() {
      return $q.when(0);
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




