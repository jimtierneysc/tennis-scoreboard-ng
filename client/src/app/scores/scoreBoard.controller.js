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
                      modalConfirm, $localStorage, loadingHelper, crudResource,
                      authHelper, waitIndicator, toastrHelper,
                      scoreboardBuilder, response) {
    var vm = this;

    activate();

    function activate() {
      vm.id = $stateParams.id;
      vm.scoreboard = {};
      vm.view = new View();

      authHelper(vm, $scope);
      loadingHelper(vm);
      toastrHelper(vm, $scope);
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

    function View() {

      var DATANAME = 'scoreboardView';

      var _this = this; // eslint-disable-line
      _this.changed = storeView;
      _this.showGames = showGames;
      _this.keepingScore = keepingScore;
      _this.localDataName = DATANAME;
      _this.expand = "collapse";
      _this.keepScore = false;
      loadView();

      function showGames(set) {  // eslint-disable-line
        if (_this.expand == 'collapse')
          return false;
        // expand_set not longer supported.   Too confusing.
        // else if (_this.expand == 'expand_set')
        //   return vm.scoreboard.sets.length <= 1 || vm.scoreboard.sets[0] == set;
        else // expand_all
          return true;
      }

      function keepingScore() {
        return vm.loggedIn && _this.keepScore;
      }

       function viewData() {
        return {
          view: {
            expand: _this.expand,
            keepScore: _this.keepScore
          }
        }
      }

      function storeView() {
        $localStorage[DATANAME] = viewData();
      }

      function loadView() {
        var data = $localStorage[DATANAME] || {};
        if (data.view) {
          _this.expand = data.view.expand;
          _this.keepScore = data.view.keepScore;
        }
      }
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
      }

      function prepareMethods() {
        sb.update = updateScore;
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




