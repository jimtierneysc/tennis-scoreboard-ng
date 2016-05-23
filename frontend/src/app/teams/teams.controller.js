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
  function MainController(teamsResource, $q, $filter, $log, $scope, playersResource, crudHelper) {
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
        entityFieldMap: {
          'name': null,
          'first': 'first_player',
          'second': 'second_player'
        }
      }
    );

    return vm;


    function beforeSubmitNewEntity(entity) {
      fixupSubmitEntity(entity);
    }

    function beforeSubmitEditEntity(entity) {
      fixupSubmitEntity(entity);
    }

    function beforeShowNewEntityForm() {
      preparePlayerOptions();
    }

    function beforeShowEditEntityForm() {
      preparePlayerOptions().then(
        function () {
          fixupEditEntityPlayers();
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

    function preparePlayerOptions() {
      var deferredObject = $q.defer();
      if (vm.playerOptionsList.list == null) {
        fillPlayerOptionsList().then(
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


    function fillPlayerOptionsList() {
      return crudHelper.fillPlayerOptionsList();
    }

    function fixupEditEntityPlayers() {
      var first_player = null;
      var second_player = null;
      var first_id = vm.editEntity.first_player_id;
      var second_id = vm.editEntity.second_player_id;
      $filter('filter')(vm.playerOptionsList.list,
        function (o) {
          if (o.id == first_id)  first_player = o;
          if (o.id == second_id) second_player = o;
          return first_player && second_player;
        });
      vm.editEntity.first_player = first_player;
      vm.editEntity.second_player = second_player;
    }

    function fixupSubmitEntity(entity) {
      if (angular.isDefined(entity.first_player))
        entity.first_player_id = entity.first_player.id;
      if (angular.isDefined(entity.second_player))
        entity.second_player_id = entity.second_player.id;

    }

  }
})();




