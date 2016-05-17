/**
 * @ngdoc controller
 * @name PlayerController
 * @description
 * Controller for displaying and editing players
 *
 */
(function () {
  'use strict';

  /* global _ */

  angular
    .module('frontend')
    .controller('PlayerController', MainController);

  /** @ngInject */
  function MainController(playersResource, $log, modalConfirm, toastr, $scope) {
    var vm = this;

    vm.destroyPlayer = destroyPlayer;
    vm.submitNewPlayerForm = submitNewPlayerForm;
    vm.showNewPlayerForm = showNewPlayerForm;
    vm.hideNewPlayerForm = hideNewPlayerForm;


    vm.newPlayer = {name: ""};
    vm.showingNewPlayerForm = false;
    vm.loading = true;
    vm.loadingMessage = 'Loading...';
    vm.loadingFailed = false;
    vm.loadingFailedMessage = null;
    vm.newPlayerForm = null;
    vm.players = [];
    vm.playerCreateErrors = null;
    vm.lastToast = null;

    activate();

    function activate() {
      getPlayers();

      $scope.$on('$destroy', function () {
        $log.log('destroying controller');
        // Remove current toasts when switch views
        toastr.clear();
      });

    }


    function getPlayers() {
      playersResource.getPlayers().query(
        function (response) {
          $log.info('received data');
          vm.players = response;
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

    function createPlayer(player) {
      var json = {player: player};
      playersResource.getPlayers().save(json,
        function (response) {
          $log.info('create/save');
          $log.info(response);
          var newPlayer = angular.merge(response, player);
          playerCreated(newPlayer);
        },
        function (response) {
          $log.info('create error ' + response.status + " " + response.statusText);
          playerCreateError(player, response)
        }
      );
    }


    function destroyPlayer(player, confirmDelete) {
      $log.info('destroy');
      if (angular.isUndefined(confirmDelete))
        confirmDelete = true;
      if (confirmDelete) {
        modalConfirm.confirm({title: 'Confirm Delete', text: 'Are you sure you want to delete "' +
            _.escape(player.name) + '"?'})
          .then(function () {
            $log.info('delete confirmed');
            removePlayer(player)
          });
      }
      else {
        removePlayer(player)

      }
    }

    function removePlayer(player) {
      var id = player.id;
      var json = {id: id};
      playersResource.getPlayers().remove(json,
        function (response) {
          $log.info('create/save player');
          $log.info(response);
          playerRemoved(player);
        },
        function (response) {
          $log.info('remove player error ' + response.status + " " + response.statusText);
          playerRemoveError(player, response)
        }
      );

    }

    function submitNewPlayerForm() {
      $log.info('submit');
      $log.info('newPlayer.name: ' + vm.newPlayer.name);
      createPlayer(vm.newPlayer)
    }

    function showNewPlayerForm() {
      $log.info('showNewPlayerForm');
      vm.showingNewPlayerForm = true;

    }

    function hideNewPlayerForm() {
      $log.info('hideNewPlayerForm');
      if (vm.newPlayerForm) {
        vm.newPlayerForm.$setPristine();
      }
      vm.showingNewPlayerForm = false;
      vm.newPlayer = {};
      vm.playerCreateErrors = null;

    }

    function playerCreated(player) {
      hideNewPlayerForm();
      vm.players.splice(0, 0, player);
      vm.playerCreateErrors = null;
    }

    function playerCreateError(player, response) {
      vm.playerCreateErrors = response.data;
    }

    function playerRemoved(player) {
      $log.info('playerRemoved: ' + player.name);
      vm.playerRemoveErrors = null;
      var i = vm.players.indexOf(player);
      if (i >= 0) {
        vm.players.splice(i, 1);
      }
    }

    function playerRemoveError(player, response) {
      showToastrError(_.escape(response.data.error), "Delete Error");
    }

    function showToastrError(message, caption) {
      if (angular.isUndefined(caption))
        caption = 'Error';

      vm.lastToast = toastr.error(message, caption);
    }

  }
})();




