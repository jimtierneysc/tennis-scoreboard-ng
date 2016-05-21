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
  function MainController(teamsResource, $log, $scope, playersResource, crudHelper) {
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


    function beforeSubmitNewEntity(newEntity) {
      if (angular.isDefined(newEntity.first_player))
        newEntity.first_player_id = newEntity.first_player.id;
      if (angular.isDefined(newEntity.second_player))
        newEntity.second_player_id = newEntity.second_player.id;

    }

    function beforeSubmitEditEntity() {
      // nothing to do. yet.
    }

    function beforeShowNewEntityForm() {
      beforeShowEntityForm();
    }

    function beforeShowEditEntityForm() {
      beforeShowEntityForm();
    }

    function getEntityDisplayName(entity) {
      // TODO: build team name
      return entity.name;
    }

    function makeEntityBody(entity) {
      return {team: entity};
    }

    // "Private" methods

    function beforeShowEntityForm() {
      if (vm.playerOptionsList.list == null) {
        fillPlayerOptionsList();
      }
    }

    function fillPlayerOptionsList() {
      playersResource.getPlayers().query(
        function (response) {
          $log.info('received data');
          var options = [];
          angular.forEach(response, function (value) {
            options.push({name: value.name, id: value.id});
          }, options);
          vm.playerOptionsList.list = options;
        },
        function (response) {
          $log.info('data error ' + response.status + " " + response.statusText);
          vm.playerOptionsList.list = [];
        }
      )
    }


  }
})();




