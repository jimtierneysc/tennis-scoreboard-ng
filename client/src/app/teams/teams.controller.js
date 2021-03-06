/**
 * @ngdoc controller
 * @name app.teams.controller:TeamsController
 * @description
 * Controller for displaying and editing teams
 *
 */
(function () {
  'use strict';

  angular
    .module('app.teams')
    .controller('TeamsController', Controller);

  /** @ngInject */
  function Controller($q, $filter, $log, $scope, crudHelper, teamsPath, playersSelectOptions, response) {
    var vm = this;

    activate();

    /**
     * @ngdoc function
     * @name activate
     * @methodOf app.teams.controller:TeamsController
     * @description
     * Initialize the controller:
     * * Add playerOptionsList object
     * * Call the crudHelper service with team-specific options.
     */
    function activate() {
      vm.playerOptionsList = {list: null};

      // authHelper(vm, $scope);
      crudHelper(vm,
        {
          response: response,
          resourceName: teamsPath,
          prepareToCreateEntity: prepareToCreateEntity,
          prepareToUpdateEntity: prepareToUpdateEntity,
          beforeShowNewEntity: beforeShowNewEntity,
          beforeShowEditEntity: beforeShowEditEntity,
          getEntityDisplayName: getEntityDisplayName,
          makeEntityBody: makeEntityBody,
          entityKind: 'Team',
          scope: $scope,
          errorsMap: {
            names: [
              'name',
              'first_player',
              'second_player'
            ]
          }
        }
      );
    }

    function prepareToCreateEntity(entity) {
      var result = {
        name: entity.name
      };
      prepareToApplyEntity(entity, result);
      return result;
    }

    function prepareToUpdateEntity(entity) {
      var result = {
        id: entity.id,
        name: entity.name
      };
      prepareToApplyEntity(entity, result);
      return result;
    }

    function beforeShowNewEntity() {
      var players = prepareToShowPlayerOptions();
      var promise = players.then(function() {
        var playerCount = vm.playerOptionsList.list.length;
        if (playerCount < 2) {
          vm.showToast('There must be at least two players.  ' +
            'Add players and try again.', 'Unable to Add Team', 'warning');
          return $q.reject();
        }
        else {
          if (playerCount == 2) {
            vm.newEntity.entity.select_first_player = vm.playerOptionsList.list[0];
            vm.newEntity.entity.select_second_player = vm.playerOptionsList.list[1];
          }
          return $q.resolve();
        }
      });
      return promise;
    }

    function beforeShowEditEntity() {
      var players = prepareToShowPlayerOptions();
      var promise = players.then(function() {
        prepareToEditEntity();
      });
      return promise;
    }

    function getEntityDisplayName(entity) {
      return entity.name || '(unnamed)'
    }

    function makeEntityBody(entity) {
      return {team: entity};
    }

    // internal methods

    function prepareToShowPlayerOptions() {
      var promise;
      if (vm.playerOptionsList.list == null) {
        promise = playersSelectOptions().then(
          function (list) {
            vm.playerOptionsList.list = list;
          },
          function () {
            vm.playerOptionsList.list = [];
            $log.error('playerOptionsList');
            return $q.resolve();
          }
        );
      }
      else {
        promise = $q.resolve();
      }
      return promise;
    }

    function prepareToEditEntity() {
      var first_player = null;
      var second_player = null;
      var first_id = null;
      var second_id = null;
      if (vm.editEntity.entity.first_player)
        first_id = vm.editEntity.entity.first_player.id;
      if (vm.editEntity.entity.second_player)
        second_id = vm.editEntity.entity.second_player.id;
      $filter('filter')(vm.playerOptionsList.list,
        function (o) {
          if (o.id == first_id)  first_player = o;
          if (o.id == second_id) second_player = o;
          return first_player && second_player;
        });
      vm.editEntity.entity.select_first_player = first_player;
      vm.editEntity.entity.select_second_player = second_player;
    }

    function prepareToApplyEntity(entity, result) {
      if (entity.select_first_player)
        result.first_player_id = entity.select_first_player.id;
      if (entity.select_second_player)
        result.second_player_id = entity.select_second_player.id;
    }

  }
})();




