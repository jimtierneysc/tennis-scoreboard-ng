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
  function MainController(teamsResource, $q, $filter, $log, $scope, playersResource, crudHelper, authHelper, playersSelectOptions, response) {
    var vm = this;

    activate();
    
    function activate() {
      vm.playerOptionsList = {list: null};
      
      authHelper.activate(vm, $scope);
      crudHelper.activate(vm,
        {
          response: response,
          getResources: teamsResource.getTeams,
          prepareToCreateEntity: prepareToCreateEntity,
          prepareToUpdateEntity: prepareToUpdateEntity,
          beforeshowNewEntity: beforeshowNewEntity,
          beforeshowEditEntity: beforeshowEditEntity,
          getEntityDisplayName: getEntityDisplayName,
          makeEntityBody: makeEntityBody,
          scope: $scope,
          errorCategories: {
            'name': null,
            'first': 'first_player',
            'second': 'second_player'
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

    function beforeshowNewEntity() {
      prepareToShowPlayerOptions();
    }

    function beforeshowEditEntity() {
      prepareToShowPlayerOptions().then(
        function () {
          prepareToEditEntity();
        }
      )
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

    function prepareToApplyEntity(entity, result) {
      if (angular.isDefined(entity.select_first_player))
        result.first_player_id = entity.select_first_player.id;
      if (angular.isDefined(entity.select_second_player))
        result.second_player_id = entity.select_second_player.id;
    }

  }
})();




