/**
 * @ngdoc controller
 * @name TeamController
 * @description
 * Controller for displaying and editing teams
 *
 */
(function () {
  'use strict';

  /* global _ */

  angular
    .module('frontend')
    .controller('TeamController', MainController);

  /** @ngInject */
  function MainController(teamsResource, $log, modalConfirm, toastr, $scope, playersResource, feUtils) {
    var vm = this;

    vm.destroyTeam = destroyTeam;
    vm.submitNewTeamForm = submitNewTeamForm;
    vm.showNewTeamForm = showNewTeamForm;
    vm.hideNewTeamForm = hideNewTeamForm;


    vm.newTeam = {name: ""};
    vm.showingNewTeamForm = false;
    vm.loading = true;
    vm.loadingMessage = 'Loading...';
    vm.loadingFailed = false;
    vm.loadingFailedMessage = null;
    vm.newTeamForm = null;
    vm.teams = [];
    vm.teamCreateErrors = null;
    vm.lastToast = null;
    vm.playerOptionsList = null;

    activate();

    function activate() {
      getTeams();

      $scope.$on('$destroy', function () {
        $log.log('destroying controller');
        // Remove current toasts when switch views
        toastr.clear();
      });

    }


    function getTeams() {
      teamsResource.getTeams().query(
        function (response) {
          $log.info('received data');
          vm.teams = response;
          vm.loading = false;
          vm.loadingFailed = false;
        },
        function (response) {
          $log.info('data error ' + response.status + " " + response.statusText);
          vm.loading = false;
          vm.loadingFailed = true;
          vm.loadingFailedMessage = 'Page cannot be displayed because the data could not be retrieved (' + response.statusText + ').  Please check your internet connection.';
        }
      );
    }

    function createTeam(team) {
      var json = {team: team};
      teamsResource.getTeams().save(json,
        function (response) {
          $log.info('create/save');
          $log.info(response);
          var newTeam = angular.merge(response, team);
          teamCreated(newTeam);
        },
        function (response) {
          $log.info('create error ' + response.status + " " + response.statusText);
          teamCreateError(team, response)
        }
      );
    }


    function destroyTeam(team, confirmDelete) {
      $log.info('destroy');
      if (angular.isUndefined(confirmDelete))
        confirmDelete = true;
      if (confirmDelete) {
        modalConfirm.confirm({
            title: 'Confirm Delete', text: 'Are you sure you want to delete "' +
            _.escape(team.name) + '"?'
          })
          .then(function () {
            $log.info('delete confirmed');
            removeTeam(team)
          });
      }
      else {
        removeTeam(team)

      }
    }

    function getPlayerOptionsList() {
      playersResource.getPlayers().query(
        function (response) {
          $log.info('received data');
          var options = [];
          angular.forEach(response, function (value) {
            options.push({name: value.name, id: value.id});
          }, options);
          vm.playerOptionsList = options;
        },
        function (response) {
          $log.info('data error ' + response.status + " " + response.statusText);
          vm.playerOptionsList = [];
          // vm.loadingFailedMessage = 'Page cannot be displayed because the data could not be retrieved (' + response.statusText + ').  Please check your internet connection.';
        }
      )
    }


    //
    // Private methods
    //

    function removeTeam(team) {
      var id = team.id;
      var json = {id: id};
      teamsResource.getTeams().remove(json,
        function (response) {
          $log.info('create/save team');
          $log.info(response);
          teamRemoved(team);
        },
        function (response) {
          $log.info('remove team error ' + response.status + " " + response.statusText);
          teamRemoveError(team, response)
        }
      );

    }

    function submitNewTeamForm() {
      $log.info('submit');
      $log.info('newTeam.name: ' + vm.newTeam.name);
      // fix up form fields
      var newTeam = angular.copy(vm.newTeam);
      if (angular.isDefined(newTeam.first_player))
        newTeam.first_player_id = newTeam.first_player.id;
      if (angular.isDefined(newTeam.second_player))
        newTeam.second_player_id = newTeam.second_player.id;
      createTeam(newTeam)
    }

    function showNewTeamForm() {
      $log.info('showNewTeamForm');
      if (vm.playerOptionsList == null) {
        vm.playerOptionsList = getPlayerOptionsList();
      }
      vm.showingNewTeamForm = true;
    }

    function hideNewTeamForm() {
      $log.info('hideNewTeamForm');
      if (vm.newTeamForm) {
        vm.newTeamForm.$setPristine();
      }
      vm.showingNewTeamForm = false;
      vm.newTeam = {};
      vm.teamCreateErrors = null;

    }

    function teamCreated(team) {
      hideNewTeamForm();
      vm.teams.splice(0, 0, team);
      vm.teamCreateErrors = null;
    }


    function normalizeErrors(data) {
      var fieldMap =
      {
        'name': null,
        'first': 'first_player',
        'second': 'second_player'
      };

      var errors = feUtils.normalizeObjectNames(data, fieldMap);
      return errors;
    }

    function teamCreateError(team, response) {
      // fixup errors
      var errors = normalizeErrors(response.data);
      vm.teamCreateErrors = errors;
    }

    function teamRemoved(team) {
      $log.info('teamRemoved: ' + team.name);
      vm.teamRemoveErrors = null;
      var i = vm.teams.indexOf(team);
      if (i >= 0) {
        vm.teams.splice(i, 1);
      }
    }

    function teamRemoveError(team, response) {
      var errors = normalizeErrors(response.data);
      var message = "";
      if (angular.isDefined(errors.other))
        message = errors.other;
      showToastrError(_.escape(message), "Delete Error");
    }

    function showToastrError(message, caption) {
      if (angular.isUndefined(caption))
        caption = 'Error';

      vm.lastToast = toastr.error(message, caption);
    }

  }
})();




