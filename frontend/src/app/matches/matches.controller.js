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
  function MainController(matchesResource, $filter, $q, $log, $scope, teamsResource, playersResource, crudHelper) {
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

    return vm;

    function beforeSubmitNewEntity(entity) {
      beforeSubmitEntity(entity)
    }

    function beforeSubmitEditEntity(entity) {
      beforeSubmitEntity(entity);
    }

    function beforeShowNewEntityForm() {
      // TODO: Preserve last selection when add multiple matches
      vm.newEntity.doubles = false;
      vm.newEntity.scoring = 'two_six_game_ten_point';
      prepareTeamOptions();
      preparePlayerOptions();
    }

    function beforeShowEditEntityForm() {
      prepareTeamOptions().then(
        function() {
          fixupEditEntityTeams();
        }
      );
      preparePlayerOptions().then(
        function() {
          fixupEditEntityPlayers();
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
    function beforeSubmitEntity(entity) {
      if (entity.doubles) {
        beforeSubmitDoubles(entity);
      }
      else {
        beforeSubmitSingles(entity);
      }
    }

    function beforeSubmitDoubles(entity) {
      fixupSubmitEntityTeams(entity);
    }

    function beforeSubmitSingles(entity) {
      fixupSubmitEntityPlayers(entity);
    }


    function prepareTeamOptions() {
      var deferredObject = $q.defer();
      if (vm.teamOptionsList.list == null) {
        fillTeamOptionsList().then(
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
    
    function fillTeamOptionsList() {
      return crudHelper.fillTeamOptionsList();
    }

    function fillPlayerOptionsList() {
      return crudHelper.fillPlayerOptionsList();
    }


    function fixupEditEntityPlayers() {
      var first_player = null;
      var second_player = null;
      var first_id = vm.editEntity.first_singles_player_id;
      var second_id = vm.editEntity.second_singles_player_id;
      $filter('filter')(vm.playerOptionsList.list,
        function (o) {
          if (o.id == first_id)  first_player = o;
          if (o.id == second_id) second_player = o;
          return first_player && second_player;
        });
      vm.editEntity.first_singles_player = first_player;
      vm.editEntity.second_singles_player = second_player;
    }

    function fixupSubmitEntityPlayers(entity) {
      if (angular.isDefined(entity.first_singles_player))
        entity.first_singles_player_id = entity.first_singles_player.id;
      if (angular.isDefined(entity.second_singles_player))
        entity.second_singles_player_id = entity.second_singles_player.id;

    }


    function fixupEditEntityTeams() {
      var first_team = null;
      var second_team = null;
      var first_id = vm.editEntity.first_team_id;
      var second_id = vm.editEntity.second_team_id;
      $filter('filter')(vm.teamOptionsList.list,
        function (o) {
          if (o.id == first_id)  first_team = o;
          if (o.id == second_id) second_team = o;
          return first_team && second_team;
        });
      vm.editEntity.first_team = first_team;
      vm.editEntity.second_team = second_team;
    }

    function fixupSubmitEntityTeams(entity) {
      if (angular.isDefined(entity.first_team))
        entity.first_team_id = entity.first_team.id;
      if (angular.isDefined(entity.second_team))
        entity.second_team_id = entity.second_team.id;
    }


  }
})();




