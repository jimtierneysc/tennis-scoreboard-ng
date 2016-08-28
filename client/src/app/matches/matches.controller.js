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
              'second_player'
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

    // Return a promise
    function beforeShowNewEntity() {
      // TODO: Preserve last selection when add multiple matches

      vm.newEntity.entity.doubles = false;
      vm.newEntity.entity.scoring = 'two_six_game_ten_point';
      var teams = prepareToShowTeamOptions();
      var players = prepareToShowPlayerOptions();
      var all = $q.all([teams, players]);
      var endWait = vm.beginWait();
      var promise = all.then(function () {
        var playerCount = vm.playerOptionsList.list.length;
        var teamCount = vm.teamOptionsList.list.length;
        if (playerCount < 2 && teamCount < 2) {
          vm.showToast('There must be at least two teams or two players.  ' +
            'Add teams or players and try again.', 'Unable to Add Match');
          return $q.reject();
        }
        else {
          if (playerCount < 2)
            vm.newEntity.entity.doubles = true;
          if (playerCount == 2) {
            vm.newEntity.entity.select_first_player = vm.playerOptionsList.list[0];
            vm.newEntity.entity.select_second_player = vm.playerOptionsList.list[1];
          }
          if (teamCount == 2) {
            vm.newEntity.entity.select_first_team = vm.teamOptionsList.list[0];
            vm.newEntity.entity.select_second_team = vm.teamOptionsList.list[1];
          }
          return $q.resolve();
        }
      }).finally(endWait);

      return promise;
    }


    // Return a promise
    function beforeShowEditEntity() {
      var teams = prepareToShowTeamOptions();
      var players = prepareToShowPlayerOptions();
      var all = $q.all([teams, players]);
      var endWait = vm.beginWait();
      var promise = all.then(function () {
        prepareToEditTeams();
        prepareToEditPlayers();
        return $q.resolve()
      }).finally(endWait);
      return promise;
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
      var promise;
      if (vm.teamOptionsList.list == null) {
        promise = teamsSelectOptions().then(
          function (list) {
            vm.teamOptionsList.list = list;
          },
          function () {
            $log.error('teamOptionsList');
            vm.teamOptionsList.list = [];
            return $q.resolve();
          }
        );
      }
      else {
        promise = $q.resolve();
      }
      return promise;
    }

    function prepareToShowPlayerOptions() {
      var promise;
      if (vm.playerOptionsList.list == null) {
        promise = playersSelectOptions().then(
          function (list) {
            vm.playerOptionsList.list = list;
          },
          function () {
            $log.error('playerOptionsList');
            vm.playerOptionsList.list = [];
            return $q.resolve();
          }
        );
      }
      else {
        promise = $q.resolve();
      }
      return promise;
    }

    function prepareToEditPlayers() {
      if (!vm.editEntity.entity.doubles) {
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
      } else {
        if (vm.playerOptionsList.list.length == 2) {
          // If user selects doubles then default to only two teams
          vm.editEntity.entity.select_first_player = vm.playerOptionsList.list[0];
          vm.editEntity.entity.select_second_player = vm.playerOptionsList.list[1];
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
      if (vm.editEntity.entity.doubles) {
        var first_team = null;
        var second_team = null;
        var first_id = null;
        var second_id = null;
        if (vm.editEntity.entity.first_team)
          first_id = vm.editEntity.entity.first_team.id;
        if (vm.editEntity.entity.second_team)
          second_id = vm.editEntity.entity.second_team.id;
        $filter('filter')(vm.teamOptionsList.list,
          function (o) {
            if (o.id == first_id)  first_team = o;
            if (o.id == second_id) second_team = o;
            return first_team && second_team;
          });
        vm.editEntity.entity.select_first_team = first_team;
        vm.editEntity.entity.select_second_team = second_team;
      } else {
        if (vm.teamOptionsList.list.length == 2) {
          // If user unselects doubles then default to only two teams
          vm.editEntity.entity.select_first_team = vm.teamOptionsList.list[0];
          vm.editEntity.entity.select_second_team = vm.teamOptionsList.list[1];
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




