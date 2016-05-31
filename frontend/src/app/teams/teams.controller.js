/**
 * @ngdoc controller
 * @name TeamController
 * @description
 * Controller for displaying and editing teams
 *
 */
(function () {
  'use strict';

  angular
    .module('frontend')
    .controller('TeamController', MainController);

  /** @ngInject */
  function MainController(teamsResource, $q, $filter, $log, $scope, playersResource, crudHelper, playersSelectOptions) {
    var vm = this;
    vm.playerOptionsList = {list: null};

    crudHelper.activate(vm,
      {
        getResources: teamsResource.getTeams,
        beforeSubmitNewEntity: beforeSubmitNewEntity,
        beforeSubmitEditEntity: beforeSubmitEditEntity,
        beforeShowNewEntityForm: beforeShowNewEntityForm,
        beforeShowEditEntityForm: beforeShowEditEntityForm,
        getEntityDisplayName: getEntityDisplayName,
        makeEntityBody: makeEntityBody,
        scope: $scope,
        // TODO: clean this up, rename or something
        entityFieldMap: {
          'name': null,
          'first': 'first_player',
          'second': 'second_player'
        }
      }
    );

    return vm;


    function beforeSubmitNewEntity(entity) {
      var result = {
        name: entity.name
      };
      prepareToSubmitPlayers(entity, result);
      return result;
    }

    function beforeSubmitEditEntity(entity) {
      var result = {
        id: entity.id,
        name: entity.name
      };
      prepareToSubmitPlayers(entity, result);
      return result;
    }

    function beforeShowNewEntityForm() {
      prepareToShowPlayerOptions();
    }

    function beforeShowEditEntityForm() {
      prepareToShowPlayerOptions().then(
        function () {
          prepareToEditEntity();
        }
      )
    }

    function getEntityDisplayName(entity) {
      // TODO: build team name
      return entity.displayName;
    }

    function makeEntityBody(entity) {
      return {team: entity};
    }

    // "Private" methods

    function prepareToShowPlayerOptions() {
      var deferredObject = $q.defer();
      if (vm.playerOptionsList.list == null) {
        playersSelectOptions.getSelectOptions().then(
          function (list) {
            vm.playerOptionsList.list = list;
            deferredObject.resolve();
          },
          function () {
            vm.playerOptionsList.list = [];
            $log.error('playerOptionsList')
            deferredObject.reject();
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

    function prepareToSubmitPlayers(entity, result) {
      if (angular.isDefined(entity.select_first_player))
        result.first_player_id = entity.select_first_player.id;
      if (angular.isDefined(entity.select_second_player))
        result.second_player_id = entity.select_second_player.id;
    }

  }
})();




