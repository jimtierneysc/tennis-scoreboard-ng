/**
 * @ngdoc controller
 * @name MatchesController
 * @description
 * Controller for displaying and editing matches
 *
 */

(function () {
  'use strict';

  angular
    .module('frontendMatches')
    .controller('MatchesController', Controller);

  /** @ngInject */
  function Controller($filter, $q, $log, $scope, crudHelper, matchesPath,
                      authHelper, playersSelectOptions, teamsSelectOptions, response) {
    var vm = this;

    activate();

    function activate() {
      vm.teamOptionsList = {list: null};
      vm.playerOptionsList = {list: null};
      authHelper(vm, $scope);
      crudHelper(vm,
        {
          response: response,
          resourceName: matchesPath,
          prepareToCreateEntity: prepareToCreateEntity,
          prepareToUpdateEntity: prepareToUpdateEntity,
          beforeShowNewEntity: beforeShowNewEntity,
          beforeShowEditEntity: beforeShowEditEntity,
          getEntityDisplayName: getEntityDisplayName,
          makeEntityBody: makeEntityBody,
          entityKind: 'Match',
          scope: $scope,
          errorsMap: {
            names: [
              'title',
              'first_team',
              'second_team',
              'first_player',
              'second_player',
              'doubles',
              'scoring'
            ]
          }
        }
      );
    }

    function prepareToCreateEntity(entity) {
      var result = {};
      prepareToSubmitEntity(entity, result);
      return result;
    }

    function prepareToUpdateEntity(entity) {
      var result = {
        id: entity.id
      };
      prepareToSubmitEntity(entity, result);
      return result;
    }

    function beforeShowNewEntity() {
      // TODO: Preserve last selection when add multiple matches
      var deferredObject = $q.defer();

      vm.newEntity.doubles = false;
      vm.newEntity.scoring = 'two_six_game_ten_point';
      var teams = prepareToShowTeamOptions();
      var players = prepareToShowPlayerOptions();
      var all = $q.all([teams, players]);
      var endWait = vm.beginWait();
      all.then(function () {
        endWait();
        var playerCount = vm.playerOptionsList.list.length;
        var teamCount = vm.teamOptionsList.list.length;
        if (playerCount < 2 && teamCount < 2) {
          // vm.hideNewEntity();
          deferredObject.reject();
          vm.showToast('There must be at least two teams or two players.  ' +
            'Add teams or players and try again.', 'Unable to Add Match', 'warning');
        }
        else {
          if (playerCount < 2)
            vm.newEntity.doubles = true;
          if (playerCount == 2) {
            vm.newEntity.select_first_player = vm.playerOptionsList.list[0];
            vm.newEntity.select_second_player = vm.playerOptionsList.list[1];
          }
          if (teamCount == 2) {
            vm.newEntity.select_first_team = vm.teamOptionsList.list[0];
            vm.newEntity.select_second_team = vm.teamOptionsList.list[1];
          }
          deferredObject.resolve();
        }
      });

      return deferredObject.promise;
    }

    function beforeShowEditEntity() {
      var deferredObject = $q.defer();
      var teams = prepareToShowTeamOptions();
      var players = prepareToShowPlayerOptions();
      var all = $q.all([teams, players]);
      var endWait = vm.beginWait();
      all.then(function () {
        endWait();
        prepareToEditTeams();
        prepareToEditPlayers();
        deferredObject.resolve();
      });
      return deferredObject.promise;
    }

    function getEntityDisplayName(entity) {
      return entity.title || '(untitled)'
    }

    function makeEntityBody(entity) {
      return {match: entity};
    }

    // "Private" methods
    function prepareToSubmitEntity(entity, result) {
      result.title = entity.title;
      result.scoring = entity.scoring;
      result.doubles = entity.doubles;
      if (entity.doubles) {
        prepareToSubmitDoubles(entity, result);
      }
      else {
        prepareToSubmitSingles(entity, result);
      }
    }

    function prepareToSubmitDoubles(entity, result) {
      prepareToSubmitTeams(entity, result);
    }

    function prepareToSubmitSingles(entity, result) {
      prepareToSubmitPlayers(entity, result);
    }

    function prepareToShowTeamOptions() {
      var deferredObject = $q.defer();
      if (vm.teamOptionsList.list == null) {
        teamsSelectOptions().then(
          function (list) {
            vm.teamOptionsList.list = list;
          },
          function () {
            vm.teamOptionsList.list = [];
            $log.error('teamOptionsList');
          }
        ).finally(function() {
          deferredObject.resolve();
        });
      }
      else {
        deferredObject.resolve();
      }
      return deferredObject.promise;
    }

    function prepareToShowPlayerOptions() {
      var deferredObject = $q.defer();
      if (vm.playerOptionsList.list == null) {
        playersSelectOptions().then(
          function (list) {
            vm.playerOptionsList.list = list;
          },
          function () {
            vm.playerOptionsList.list = [];
            $log.error('playerOptionsList')
          }
        ).finally(function() {
          deferredObject.resolve();
        });
      }
      else {
        deferredObject.resolve();
      }
      return deferredObject.promise;
    }

    function prepareToEditPlayers() {
      if (!vm.editEntity.doubles) {
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
      } else {
        if (vm.playerOptionsList.list.length == 2) {
          // If user selects doubles then default to only two teams
          vm.editEntity.select_first_player = vm.playerOptionsList.list[0];
          vm.editEntity.select_second_player = vm.playerOptionsList.list[1];
        }
      }
    }

    function prepareToSubmitPlayers(entity, result) {
      if (entity.select_first_player)
        result.first_player_id = entity.select_first_player.id;
      if (entity.select_second_player)
        result.second_player_id = entity.select_second_player.id;
    }

    function prepareToEditTeams() {
      if (vm.editEntity.doubles) {
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
      } else {
        if (vm.teamOptionsList.list.length == 2) {
          // If user unselects doubles then default to only two teams
          vm.editEntity.select_first_team = vm.teamOptionsList.list[0];
          vm.editEntity.select_second_team = vm.teamOptionsList.list[1];
        }
      }
    }

    function prepareToSubmitTeams(entity, result) {
      if (entity.select_first_team)
        result.first_team_id = entity.select_first_team.id;
      if (entity.select_second_team)
        result.second_team_id = entity.select_second_team.id;
    }
  }
})();




