/**
 * @ngdoc controller
 * @name MatchController
 * @description
 * Controller for displaying and editing matches
 *
 */
(function () {
  'use strict';

  angular
    .module('frontend')
    .controller('MatchController', MainController);

  /** @ngInject */
  function MainController(matchesResource, $filter, $q, $log, $scope, teamsResource, playersResource, crudHelper,
    playersSelectOptions, teamsSelectOptions) {
    var vm = this;
    vm.teamOptionsList = {list: null};
    vm.playerOptionsList = {list: null};

    crudHelper.activate(vm,
      {
        getResources: matchesResource.getMatches,
        beforeSubmitNewEntity: beforeSubmitNewEntity,
        beforeSubmitEditEntity: beforeSubmitEditEntity,
        beforeShowNewEntityForm: beforeShowNewEntityForm,
        beforeShowEditEntityForm: beforeShowEditEntityForm,
        getEntityDisplayName: getEntityDisplayName,
        makeEntityBody: makeEntityBody,
        scope: $scope,
        entityFieldMap: {
          'title': null,
          'first_team': 'first_team',
          'second_team': 'second_team',
          'first_singles_player': 'first_singles_player',
          'second_singles_player': 'second_singles_player',
          'doubles': null,
          'scoring': null
        }
      }
    );


    function beforeSubmitNewEntity(entity) {
      var result = {};
      beforeSubmitEntity(entity, result);
      return result;
    }

    function beforeSubmitEditEntity(entity) {
      var result = {
        id: entity.id
      };
      beforeSubmitEntity(entity, result);
      return result;
    }

    function beforeShowNewEntityForm() {
      // TODO: Preserve last selection when add multiple matches
      vm.newEntity.doubles = false;
      vm.newEntity.scoring = 'two_six_game_ten_point';
      prepareToShowTeamOptions();
      prepareToShowPlayerOptions();
    }

    function beforeShowEditEntityForm() {
      prepareToShowTeamOptions().then(
        function () {
          prepareToEditTeams();
        }
      );
      prepareToShowPlayerOptions().then(
        function () {
          prepareToEditPlayers();
        }
      );
    }

    function getEntityDisplayName(entity) {
      return entity.title;
    }

    function makeEntityBody(entity) {
      return {match: entity};
    }

    // "Private" methods
    function beforeSubmitEntity(entity, result) {
      result.title = entity.title;
      result.scoring = entity.scoring;
      result.doubles = entity.doubles;
      if (entity.doubles) {
        beforeSubmitDoubles(entity, result);
      }
      else {
        beforeSubmitSingles(entity, result);
      }
    }

    function beforeSubmitDoubles(entity, result) {
      prepareToSubmitTeams(entity, result);
    }

    function beforeSubmitSingles(entity, result) {
      prepareToSubmitPlayers(entity, result);
    }


    function prepareToShowTeamOptions() {
      var deferredObject = $q.defer();
      if (vm.teamOptionsList.list == null) {
        teamsSelectOptions.getSelectOptions().then(
          function (list) {
            vm.teamOptionsList.list = list;
            deferredObject.resolve();
          },
          function () {
            vm.teamOptionsList.list = [];
            $log.error('teamOptionsList');
            deferredObject.reject();
          }
        );
      }
      else {
        deferredObject.resolve();
      }
      return deferredObject.promise;
    }

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

    function prepareToEditPlayers() {
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


    function prepareToEditTeams() {
      var first_team = null;
      var second_team = null;
      var first_id = null;
      var second_id = null;
      if (vm.editEntity.first_team)
        first_id = vm.editEntity.first_team.id;
      if (vm.editEntity.second_team)
        second_id = vm.editEntity.second_team.id;
      $filter('filter')(vm.teamOptionsList.list,
        function (o) {
          if (o.id == first_id)  first_team = o;
          if (o.id == second_id) second_team = o;
          return first_team && second_team;
        });
      vm.editEntity.select_first_team = first_team;
      vm.editEntity.select_second_team = second_team;
    }

    function prepareToSubmitTeams(entity, result) {
      if (angular.isDefined(entity.select_first_team))
        result.first_team_id = entity.select_first_team.id;
      if (angular.isDefined(entity.select_second_team))
        result.second_team_id = entity.select_second_team.id;
    }


  }
})();




