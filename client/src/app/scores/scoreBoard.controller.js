/**
 * @ngdoc controller
 * @name ScoreBoardController
 * @description
 * Controller for displaying a match score
 *
 */
(function () {
  'use strict';

  angular
    .module('frontend')
    .controller('ScoreBoardController', MainController);

  /** @ngInject */
  function MainController($log, $q, $scope, $stateParams, feUtils, modalConfirm, $cookies, scoreBoardResource, loadingHelper,
                          authHelper, waitIndicator, toastrHelper, response) {
    var vm = this;

    activate();

    function activate() {
      vm.id = $stateParams.id;
      vm.scoreBoard = {};
      vm.view = {
        expand: "collapse",
        keepScore: false
      };

      vm.updateScore = updateScore;
      vm.changeViewExpand = changeViewExpand;
      vm.changeViewKeepScore = changeViewKeepScore;


      authHelper.activate(vm, $scope);
      loadingHelper.activate(vm);
      toastrHelper.activate(vm, $scope);
      getCookies();
      if (response) {
        if (angular.isDefined(response.id))
          getScoreBoardSucceeded(response);
        else
          getScoreBoardFailed(response);
      }
      else {
        getScoreBoard();
      }
    }

    function changeViewExpand() {
      $log.info('cookie');
      $cookies.put('viewExpand', vm.view.expand);
    }

    function changeViewKeepScore() {
      $log.info('cookie');
      $cookies.put('viewKeepScore', vm.view.keepScore);
    }

    function updateScore(action, params, confirm) {

      var confirmActions = {
        discard_play: 'Confirm Clear Scoreboard',
        restart_play: 'Confirm Restart Scoring'
      };

      $log.info('confirm');
      if (angular.isUndefined(confirm))
        confirm = true;
      confirm = confirm && confirmActions[action]; // ['discard_play', 'restart_play'].indexOf(action) >= 0;
      if (confirm) {
        modalConfirm.confirm({
          title: confirmActions[action], text: 'Are you sure you want to clear scores of match "' +
          feUtils.escapeHtml(vm.scoreBoard.title) + '"?'
        })
          .then(function () {
            $log.info('update confirmed');
            scoreBoardResourceUpdate(action, params);
          });
      }
      else {
        scoreBoardResourceUpdate(action, params);
      }
    }

    //
    // Internal methods
    //

    function getCookies() {
      var expand = $cookies.get('viewExpand');
      if (expand) {
        vm.view.expand = expand;
      }
      var keepScore = $cookies.get('viewKeepScore');
      if (keepScore) {
        vm.view.keepScore = keepScore == 'true';
      }
    }

    function getScoreBoard() {
      var endWait = waitIndicator.beginWait();
      scoreBoardResource.getScoreBoard().get({id: vm.id},
        function (response) {
          endWait();
          getScoreBoardSucceeded(response);
        },
        function (response) {
          endWait();
          getScoreBoardFailed(response);
        }
      );
    }

    function getScoreBoardSucceeded(response) {
      $log.info('received data');
      vm.scoreBoard = response;
      prepareScoreBoard(vm.scoreBoard);
      vm.loadingHasCompleted();
    }

    function getScoreBoardFailed(response) {
      $log.error('data error ' + response.status + " " + response.statusText);
      vm.loadingHasFailed(response);
    }

    function scoreBoardResourceUpdate(action, params) {
      var key = {id: vm.id};
      var body = makeUpdateBody(action, params);
      var endWait = waitIndicator.beginWait();
      scoreBoardResource.getScoreBoard().update(key, body,
        function (response) {
          $log.info('update score');
          $log.info(response);
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
          var opponent = vm.scoreBoard.opponents[id];
          if (vm.scoreBoard.doubles)
            params.team = opponent;
          else
            params.player = opponent;
        }
      }

      params.action = action;
      return {match_score_board: params};
    }

    function scoreUpdated(response) {
      angular.copy(response, vm.scoreBoard);
      if (vm.scoreBoard.errors && !angular.equals({}, vm.scoreBoard.errors)) {
        var errors = feUtils.categorizeProperties(vm.scoreBoard.errors, null);
        var message = null;
        if (angular.isDefined(errors.other))
          message = errors.other[0];
        if (!message)
          message = 'Unable to update score';
        vm.showToastrError(message)
      }
      prepareScoreBoard(vm.scoreBoard);
    }

    function scoreUpdateError(body, response) {
      vm.loadingHasFailed(response, null);
    }

    // prepare scoreboard for viewing
    function prepareScoreBoard(sb) {
      var tieBreakTitle = 'Tiebreak'
      var setsTitles = {
        1: '1st',
        2: '2nd',
        3: '3rd'
      };

      prepareOpponents();
      prepareServing();
      prepareScores();
      prepareTitles();
      prepareView();
      prepareUpdate();
      if (sb.actions.start_tiebreaker || sb.actions.start_next_game)
        prepareNewGame();
      if (sb.actions.start_match_tiebreaker || sb.actions.start_next_set)
        prepareNewSet();
      // Reverse order of sets and games to
      // display most recent games at top of view.
      // Once the set is complete, do not reverse.
      // if (sb.state != 'complete')
      reverseOrder();  // Always reverse

      function prepareUpdate() {

        // Method to update the score
        sb.updateScore = vm.updateScore;
        sb.keepingScore = keepingScore;

        function keepingScore() {
          return vm.loggedIn && vm.view.keepScore;
        }
      }

      function prepareView() {
        // View model
        sb.view = vm.view;

        // Methods to update the view
        sb.changeViewExpand = vm.changeViewExpand;
        sb.changeViewKeepScore = vm.changeViewKeepScore;

        sb.showMatchButton = sb.state != 'in_progress' && !sb.actions.complete_set_play && !sb.actions.complete_match_tiebreaker &&
          (sb.actions.complete_play || sb.actions.restart_play || sb.actions.start_play);
        sb.showSetButton =
          sb.actions.start_next_set || sb.actions.complete_set_play || sb.actions.start_match_tiebreaker ||
          sb.actions.complete_set_play || sb.actions.complete_match_tiebreaker;
        sb.showGameButton = sb.actions.win_game || sb.actions.win_tiebreaker || sb.actions.start_next_game ||
          sb.actions.start_tiebreaker || sb.actions.win_match_tiebreaker;
        sb.showWinGameButton = sb.actions.win_game || sb.actions.win_tiebreaker || sb.actions.win_match_tiebreaker;
        sb.gameTiebreakerLabel = sb.actions.win_tiebreaker || sb.actions.win_match_tiebreaker ? 'Tiebreak' : null;

        angular.forEach(sb.sets, function (set) {
          set.showGames = showSetGames;
        });

        function showSetGames() {
          if (vm.view.expand == 'collapse')
            return false;
          else if (vm.view.expand == 'expand_set')
            return vm.scoreBoard.sets.length <= 1 || vm.scoreBoard.sets[0] == this;
          else // expand_all
            return true;
        }
      }

      // Add running score to each set
      function prepareScores() {

        function incScore(scores, value) {
          if (angular.isDefined(value.winner))
            scores[sb.opponents.indexOf(value.winner)] += 1;
        }

        // Add some properties to make rendering code simple
        var matchScore = [0, 0];
        angular.forEach(sb.sets, function (set) {
          incScore(matchScore, set);
          var setScore = [0, 0];


          angular.forEach(set.games, function (game) {
            incScore(setScore, game);
            // Game score no longer used
            // // Add a scores property to a game
            // game.scores = angular.copy(setScore);
          });

          // Add a scores property to a set
          set.scores = setScore;
        });
        // Add a scores property to a match
        sb.scores = matchScore;

      }


    // Add set and game titles
    function prepareTitles() {
      var setsCount = 0;

        // var tieBreakTitle = 'Tiebreak'
        // set titles and game titles properties
        angular.forEach(sb.sets, function (set) {
          setsCount++;
          if (set.tiebreaker)
            set.title = 'Tiebreak';
          else
            set.title = setsTitles[setsCount];
          var gameCount = 0;
          angular.forEach(set.games, function (game) {
            gameCount++;
            if (game.tiebreaker)
              game.title = tieBreakTitle;
            else
              game.title = gameCount.toString();
          });
        });
      }


      // Add opponents property
      function prepareOpponents() {
        // An opponent is either a player or a team
        var opponents;
        if (sb.doubles)
          opponents = [sb.first_team.id, sb.second_team.id];
        else
          opponents = [sb.first_player.id, sb.second_player.id];

        sb.opponents = opponents;

      }

      // Add server property
      function prepareServing() {
        var lastGame = null;
        if (sb.state == 'in_progress') {
          if (sb.sets.length > 0) {
            var lastSet = sb.sets[sb.sets.length-1];
            if (lastSet.games.length > 0) {
              lastGame = lastSet.games[lastSet.games.length-1];
            }
          }
        }
        if (lastGame) {
          sb.server = lastGame.server;
        }
      }

      // Add newGame property if a game is starting
      // Add startServing property if a first server is neeeded
      function prepareNewGame() {
        // newGame property
        var newGame = {};
        sb.newGame = newGame;
        var set = sb.sets[sb.sets.length - 1];
        newGame.set = set;
        if (sb.actions.start_tiebreaker)
          newGame.title = tieBreakTitle;
        else {
          var nextGame = set.games.length + 1;
          newGame.title = nextGame.toString();
        }

        if ((sb.doubles && sb.servers.length < 2) || (!sb.doubles && sb.servers.length < 1)) {
          // Server must be selected when starting game
          var startServing = new playerServing(sb);
          sb.startServing = startServing;
        }
      }

      // Add newSet property if a set is starting
      function prepareNewSet() {
        // newSet property
        // if (sb.actions.start_match_tiebreaker || sb.actions.start_next_set) {
        var newSet = {};
        sb.newSet = newSet;
        if (sb.actions.start_match_tiebreaker)
          newSet.title = tieBreakTitle;
        else {
          var nextSet = sb.sets.length + 1;
          newSet.title = setsTitles[nextSet];
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

    // Class to select player to serve next game
    function playerServing(scores) {
      var ps = this;
      ps.players = null;
      ps.playerId = null;

      activate();

      function activate() {
        listPlayers();
      }

      function listPlayers() {
        var list = [];

        if (scores.doubles) {
          if (scores.servers.length == 1) {
            if ([scores.first_team.first_player.id,
                scores.first_team.second_player_id].indexOf(scores.servers[0]) >= 0) {
              addTeamPlayers([scores.second_team]);
            }
            else
              addTeamPlayers([scores.first_team]);
          }
          else {
            addTeamPlayers([scores.first_team, scores.second_team]);
          }
        }
        else {
          addPlayers([scores.first_player, scores.second_player]);
        }
        ps.players = list;
        ps.playerId = list[0].id;

        function addPlayers(players) {
          angular.forEach(players, function (player) {
            list.push(
              {
                id: player.id,
                name: player.name
              });
          });
        }

        function addTeamPlayers(teams) {
          angular.forEach(teams, function (team) {
            addPlayers([team.first_player, team.second_player]);
          });
        }

      }
    }
  }
})();




