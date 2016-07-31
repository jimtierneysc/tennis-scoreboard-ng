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
    .module('frontendScores')
    .controller('ScoreboardController', Controller);

  /** @ngInject */
  function Controller($log, $q, $scope, $stateParams, errorsMapper, scoreboardResource,
                      modalConfirm, $localStorage, loadingHelper, crudResource,
                      authHelper, waitIndicator, toastrHelper,
                      scoreboardBuilder, response) {
    var vm = this;

    activate();

    function activate() {
      vm.id = $stateParams.id;
      vm.scoreboard = {};
      vm.view = new View();
      vm.updatingScore = false;

      // Set ScoresController.vmScoreboard.  Needed by <fe-score-commands>.
      var scoresController = $scope.$parent;
      var vmScoreboard = {view: vm.view, scores: vm.scoreboard};
      scoresController.vmScoreboard = vmScoreboard;
      $scope.$on('$destroy', function() {
        if (scoresController.vmScoreboard == vmScoreboard)
          scoresController.vmScoreboard = null
      });

      authHelper(vm, $scope);
      loadingHelper(vm);
      toastrHelper(vm, $scope);
      if (angular.isDefined(response.id))
        getScoreBoardSucceeded(response);
      else
        getScoreBoardFailed(response);
    }


    //
    // Internal methods
    //


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

    function getScoreBoardSucceeded(response) {
      var scoreboard = {};
      angular.copy(response, scoreboard);
      // vm.scoreboard = response;
      prepareScoreBoard(scoreboard);
      angular.copy(scoreboard, vm.scoreboard);
      vm.updateLoadingCompleted();
    }

    function getScoreBoardFailed(response) {
      $log.error('data error ' + response.status + " " + response.statusText);
      vm.updateLoadingFailed(response);
    }

    function scoreboardResourceUpdate(action, params) {
      var key = {id: vm.id};
      var body = makeUpdateBody(action, params);
      var endWait = waitIndicator.beginWait();
      vm.updatingScore = true;
      crudResource.getResource(scoreboardResource).save(key, body,
        function (response) {
          endWait();
          vm.updatingScore = false;
          scoreUpdated(response);
        },
        function (response) {
          $log.error('update error ' + response.status + " " + response.statusText);
          endWait();
          vm.updatingScore = false;
          scoreUpdateError(body, response);
        }
      );
    }

    function makeUpdateBody(action, id) {
      var params = {};
      if (vm.scoreboard.version)
        params.version = vm.scoreboard.version;
      if (action == 'start_game') {
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
      var scoreboard = {}
      angular.copy(response, scoreboard);
      // angular.copy(response, vm.scoreboard);
      if (scoreboard.errors && !angular.equals({}, scoreboard.errors)) {
        var errors = errorsMapper(scoreboard.errors, null);
        var message = 'Unable to update score';
        if (angular.isDefined(errors.other[0]))
          message = errors.other[0];
        vm.showToast(message)
      }
      prepareScoreBoard(scoreboard);
      angular.copy(scoreboard, vm.scoreboard);
    }

    function scoreUpdateError(body, response) {
      if (!vm.showHttpErrorToast(response.status))
        vm.updateLoadingFailed(response);
    }

    function View() {

      var DATANAME = 'scoreboardView';

      var _this = this; // eslint-disable-line
      _this.changed = storeView;
      _this.showGames = showGames;
      _this.keepingScore = keepingScore;
      _this.toggleShowDetails = toggleShowDetails;
      _this.localDataName = DATANAME;
      _this.expand = "collapse";
      _this.keepScore = false;
      _this.showDetails = false;
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

      function toggleShowDetails() {
        _this.showDetails = !_this.showDetails
      }

      function viewData() {
        return {
          view: {
            expand: _this.expand,
            keepScore: _this.keepScore,
            showDetails: _this.showDetails
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
          _this.showDetails = data.view.showDetails;
        }
      }
    }

    // prepare scoreboard for viewing
    function prepareScoreBoard(sb) {

      // Add some properties to the score board object
      prepareValues();
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




