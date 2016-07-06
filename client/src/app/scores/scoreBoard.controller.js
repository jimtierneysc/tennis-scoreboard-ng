/**
 * @ngdoc controller
 * @name ScoreboardController
 * @description
 * Controller for displaying a match score
 *
 */
(function () {
  'use strict';

  angular
    .module('frontend')
    .controller('ScoreboardController', Controller);

  /** @ngInject */
  function Controller($log, $q, $scope, $stateParams, categorizeProperties, scoreboardResource,
                      modalConfirm, $cookies, loadingHelper, crudResource,
                      authHelper, waitIndicator, toastrHelper, response,
                      scoreboardBuilder) {
    var vm = this;
    var view;

    activate();

    function activate() {
      vm.id = $stateParams.id;
      vm.scoreboard = {};
      view = {
        expand: "collapse",
        keepScore: false
      };

      authHelper(vm, $scope);
      loadingHelper(vm);
      toastrHelper(vm, $scope);
      getCookies();
      if (angular.isDefined(response.id))
        getScoreBoardSucceeded(response);
      else
        getScoreBoardFailed(response);
    }


    function updateScore(action, params, confirm) {

      var confirmActions = {
        discard_play: 'Confirm Clear Scoreboard',
        restart_play: 'Confirm Restart Scoring'
      };

      if (angular.isUndefined(confirm))
        confirm = true;
      confirm = confirm && confirmActions[action];
      if (confirm) {
        modalConfirm.confirm({
          title: confirmActions[action], text: 'Are you sure you want to clear scores of match "' +
          vm.scoreboard.title + '"?'
        })
          .then(function () {
            scoreboardResourceUpdate(action, params);
          });
      }
      else {
        scoreboardResourceUpdate(action, params);
      }
    }

    //
    // Internal methods
    //

    function getCookies() {
      var expand = $cookies.get('viewExpand');
      if (expand) {
        view.expand = expand;
      }
      var keepScore = $cookies.get('viewKeepScore');
      if (keepScore) {
        view.keepScore = keepScore == 'true';
      }
    }

    function getScoreBoardSucceeded(response) {
      vm.scoreboard = response;
      prepareScoreBoard(vm.scoreboard);
      vm.loadingHasCompleted();
    }

    function getScoreBoardFailed(response) {
      $log.error('data error ' + response.status + " " + response.statusText);
      vm.loadingHasFailed(response);
    }

    function scoreboardResourceUpdate(action, params) {
      var key = {id: vm.id};
      var body = makeUpdateBody(action, params);
      var endWait = waitIndicator.beginWait();
      crudResource.getResource(scoreboardResource).save(key, body,
        function (response) {
          endWait();
          scoreUpdated(response);
        },
        function (response) {
          $log.error('update error ' + response.status + " " + response.statusText);
          endWait();
          scoreUpdateError(body, response);
        }
      );
    }

    function makeUpdateBody(action, id) {
      var params = {};
      if (action == 'start_next_game') {
        if (id) {
          // player to serve next
          params.player = id;
        }
      }
      else if (action.startsWith('win')) {
        if (id == 0 || id == 1) {
          var opponent = vm.scoreboard.opponents[id];
          if (vm.scoreboard.doubles)
            params.team = opponent;
          else
            params.player = opponent;
        }
      }

      params.action = action;
      return {match_score_board: params};
    }

    function scoreUpdated(response) {
      angular.copy(response, vm.scoreboard);
      if (vm.scoreboard.errors && !angular.equals({}, vm.scoreboard.errors)) {
        var errors = categorizeProperties(vm.scoreboard.errors, null);
        var message = 'Unable to update score';
        if (angular.isDefined(errors.other[0]))
          message = errors.other[0];
        vm.showToastrError(message)
      }
      prepareScoreBoard(vm.scoreboard);
    }

    function scoreUpdateError(body, response) {
      vm.loadingHasFailed(response);
    }

    // prepare scoreboard for viewing
    function prepareScoreBoard(sb) {

      // Add some values to the score board object
      prepareValues();
      // Add some methods to the score board object
      prepareMethods();
      // Reverse order of sets and games to
      // display most recent games at top of view.
      reverseOrder();

      function prepareValues() {
        sb.opponents = scoreboardBuilder.opponents(sb);
        sb.server = scoreboardBuilder.server(sb);
        scoreboardBuilder.insertScores(sb);
        scoreboardBuilder.insertTitles(sb);
        sb.btns = scoreboardBuilder.buttonStatus(sb);
        var newGame = scoreboardBuilder.newGame(sb);
        if (newGame) {
          sb.newGame = newGame;
          var firstServers = scoreboardBuilder.firstServers(sb);
          if (firstServers) {
            sb.firstServers =
            {
              list: firstServers,
              id: firstServers[0].id
            };
          }
        } else {
          var newSet = scoreboardBuilder.newSet(sb);
          if (newSet)
            sb.newSet = newSet;
        }
        sb.view = view;
      }

      function prepareMethods() {

        sb.keepingScore = function () {
          return vm.loggedIn && view.keepScore;
        };

        // Method to update the score
        sb.updateScore = updateScore;
        // Methods to update the view
        sb.changeViewExpand = changeViewExpand;
        sb.changeViewKeepScore = changeViewKeepScore;

        angular.forEach(sb.sets, function (set) {
          set.showGames = showSetGames;
        });

        function showSetGames() {
          if (vm.view.expand == 'collapse')
            return false;
          else if (vm.view.expand == 'expand_set')
            return vm.scoreboard.sets.length <= 1 || vm.scoreboard.sets[0] == this;
          else // expand_all
            return true;
        }

        function changeViewExpand() {
          $cookies.put('viewExpand', vm.view.expand);
        }

        function changeViewKeepScore() {
          $cookies.put('viewKeepScore', vm.view.keepScore);
        }

      }

      function reverseOrder() {
        // Reverse order of sets and games to
        // displays most recent games at top of view.
        // Once the set is complete, display in ascending order
        // if (sb.state != 'complete') {
        angular.forEach(sb.sets, function (set) {
          set.games.reverse();
        });
        sb.sets.reverse();
      }
    }
  }
})();




