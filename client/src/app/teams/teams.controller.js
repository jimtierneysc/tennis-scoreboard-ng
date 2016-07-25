/**
 * @ngdoc controller
 * @name TeamsController
 * @description
 * Controller for displaying and editing teams
 *
 */
(function () {
  'use strict';

  angular
    .module('frontend-teams')
    .controller('TeamsController', Controller);

  /** @ngInject */
  function Controller($q, $filter, $log, $scope, crudHelper, authHelper, teamsResource, playersSelectOptions, response) {
    var vm = this;

    activate();

    function activate() {
      vm.playerOptionsList = {list: null};

      authHelper(vm, $scope);
      crudHelper(vm,
        {
          response: response,
          resourceName: teamsResource,
          // getResources: teamsResource.getTeams,
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
      var deferredObject = $q.defer();
      var players = prepareToShowPlayerOptions();
      var endWait = vm.beginWait();
      players.then(function() {
        endWait();
        var playerCount = vm.playerOptionsList.list.length;
        if (playerCount < 2) {
          deferredObject.reject();
          vm.showToast('There must be at least two players.  ' +
            'Add players and try again.', 'Unable to Add Team', 'warning');
        }
        else {
          if (playerCount == 2) {
            vm.newEntity.select_first_player = vm.playerOptionsList.list[0];
            vm.newEntity.select_second_player = vm.playerOptionsList.list[1];
          }
          deferredObject.resolve();
        }
      });
      return deferredObject.promise;
    }

    function beforeShowEditEntity() {
      var deferredObject = $q.defer();
      var players = prepareToShowPlayerOptions();
      var endWait = vm.beginWait();
      players.then(function() {
        endWait();
        prepareToEditEntity();
        deferredObject.resolve();
      });
      return deferredObject.promise;
    }

    function getEntityDisplayName(entity) {
      // TODO: build team name
      return entity.name || '(unnamed)'
    }

    function makeEntityBody(entity) {
      return {team: entity};
    }

    // internal methods

    function prepareToShowPlayerOptions() {
      var deferredObject = $q.defer();
      if (vm.playerOptionsList.list == null) {
        playersSelectOptions().then(
          function (list) {
            vm.playerOptionsList.list = list;
            deferredObject.resolve();
          },
          function () {
            vm.playerOptionsList.list = [];
            $log.error('playerOptionsList')
            deferredObject.resolve();
          }
        );
      }
      else {
        deferredObject.resolve();
      }
      return deferredObject.promise;
    }

    function prepareToEditEntity() {
      var first_player = null;
      var second_player = null;
      var first_id = null;
      var second_id = null;
      if (vm.editEntity.first_player)
        first_id = vm.editEntity.first_player.id;
      if (vm.editEntity.second_player)
        second_id = vm.editEntity.second_player.id;
      $filter('filter')(vm.playerOptionsList.list,
        function (o) {
          if (o.id == first_id)  first_player = o;
          if (o.id == second_id) second_player = o;
          return first_player && second_player;
        });
      vm.editEntity.select_first_player = first_player;
      vm.editEntity.select_second_player = second_player;
    }

    function prepareToApplyEntity(entity, result) {
      if (angular.isDefined(entity.select_first_player))
        result.first_player_id = entity.select_first_player.id;
      if (angular.isDefined(entity.select_second_player))
        result.second_player_id = entity.select_second_player.id;
    }

  }
})();




