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
  function Controller($log, $scope, $stateParams, errorsMapper, scoreboardPath,
                      modalConfirm, $localStorage, loadingHelper, crudResource,
                      authHelper, waitIndicator, toastrHelper,
                      scoreboardPrep, $timeout, $animate, response) {
    var vm = this;

    activate();

    function activate() {
      vm.id = $stateParams.id;
      vm.scoreboard = {};
      vm.view = new View();

      // Set ScoresController.vmScoreboard.  Needed by <fe-score-commands>.
      var scoresController = $scope.$parent;
      var vmScoreboard = {view: vm.view, scores: vm.scoreboard};
      scoresController.vmScoreboard = vmScoreboard;
      $scope.$on('$destroy', function () {
        if (scoresController.vmScoreboard == vmScoreboard)
          scoresController.vmScoreboard = null
      });

      authHelper(vm, $scope);
      loadingHelper(vm);
      toastrHelper(vm, $scope);

      if (angular.isDefined(response.id))
        getScoreboardSucceeded(response);
      else
        getScoreboardFailed(response);
    }


    //
    // Internal methods
    //


    function updateScore(action, params, confirm) {
      vm.clearToast();

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
            scoreboardUpdate(action, params);
          });
      }
      else {
        scoreboardUpdate(action, params);
      }
    }

    function getScoreboardSucceeded(response) {
      updateView(response, undefined, undefined, false)
      vm.updateLoadingCompleted();
    }

    function getScoreboardFailed(response) {
      $log.error('data error ' + response.status + " " + response.statusText);
      vm.updateLoadingFailed(response);
    }

    function scoreboardUpdate(action, params) {
      if (!vm.view.updating) { // prevent reentrance
        var key = {id: vm.id};
        var body = makeUpdateBody(action, params);
        var endWait = waitIndicator.beginWait();
        vm.view.updating = true;
        crudResource.getResource(scoreboardPath).save(key, body,
          function (response) {
            endWait();
            vm.view.updating = false;
            updateView(response, action, params, true);
          },
          function (response) {
            $log.error('update error ' + response.status + " " + response.statusText);
            endWait();
            vm.view.updating = false;
            viewError(body, response);
          }
        );
      }
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

    function updateView(response, action, params, animate) {
      var sb = {};
      angular.copy(response, sb);
      // angular.copy(response, vm.scoreboard);
      if (sb.errors && !angular.equals({}, sb.errors)) {
        var errors = errorsMapper(sb.errors, null);
        var message = 'Unable to update score';
        if (angular.isDefined(errors.other[0]))
          message = errors.other[0];
        vm.showToast(message)
      }
      prepareScoreboard(sb, action, params);
      animate = false;
      if (animate) {

        // // Sort of works
        // vm.view.settingScore = true;
        // var timer = $timeout(function () {
        //   var timer = $timeout(function() {
        //     $animate.enabled(false);
        //     angular.copy(sb, vm.scoreboard);
        //     var timer = $timeout(function() {
        //       $animate.enabled(true);
        //       vm.view.settingScore = false;
        //     }, 500);
        //   }, 500);
        // }, 1);

        // // hide and show buttons
        // var timer = $timeout(function () {
        //   vm.view.animatingButtons = true;
        //   var timer = $timeout(function() {
        //     $animate.enabled(false);
        //     angular.copy(sb, vm.scoreboard);
        //     $animate.enabled(true);
        //     var timer = $timeout(function() {
        //       vm.view.animatingButtons = false;
        //     }, 2500);
        //   }, 2500);
        // }, 2500);



        // // hide and show scores
        // var timer = $timeout(function () {
        //   // vm.view.animatingScores = true;
        //   var timer = $timeout(function() {
        //     $animate.enabled(false);
        //     angular.copy(sb, vm.scoreboard);
        //     $animate.enabled(true);
        //     vm.view.animatingScores = true;
        //     var timer = $timeout(function() {
        //       vm.view.animatingScores = false;
        //     }, 2500);
        //   }, 2500);
        // }, 2500);


        // hide and show scores and buttons
        var timer = $timeout(function () {
          vm.view.animatingButtons = true;
          var timer = $timeout(function() {
            $animate.enabled(false);
            angular.copy(sb, vm.scoreboard);
            $animate.enabled(true);
            vm.view.animatingScores = true;
            var timer = $timeout(function() {
              vm.view.animatingScores = false;
              vm.view.animatingButtons = false;
            }, 1250);
          }, 1250);
        }, 1);



        // var timer = $timeout(function () {
        //   // $animate.enabled(true);
        //   // if (animate)
        //   //   vm.view.settingScore = false;
        //
        //   // $animate.enabled(true);
        //   var timer = $timeout(function () {
        //     $animate.enabled(false);
        //     angular.copy(sb, vm.scoreboard);
        //     $animate.enabled(true);
        //     vm.view.settingScore = false;
        //   }, 1);
        //   $scope.$on('$destroy', function () {
        //       $animate.enabled(true);
        //       $timeout.cancel(timer);
        //     }
        //   );
        // }, 1);
        // $scope.$on('$destroy', function () {
        //     $animate.enabled(true);
        //     $timeout.cancel(timer);
        //   }
        // );

      }
      else {
        $animate.enabled(false);
        angular.copy(sb, vm.scoreboard);
        $animate.enabled(true);
      }
    }

    function viewError(body, response) {
      if (!vm.showHttpErrorToast(response.status))
        vm.updateLoadingFailed(response);
    }

    function View() {

      var DATANAME = 'scoreboardView';

      var view = this; // eslint-disable-line
      view.changed = storeView;
      view.showGames = showGames;
      view.keepingScore = keepingScore;
      view.toggleShowDetails = toggleShowDetails;
      view.changingSetTitle = changingSetTitle;
      view.changingSetResult = changingSetResult;
      view.changingGameTitle = changingGameTitle;
      view.changingGameResult = changingGameResult;
      view.changingMatchResult = changingMatchResult;
      view.localDataName = DATANAME;
      view.expand = "collapse";
      view.keepScore = false;
      view.showDetails = false;
      view.updating = false;      // disable UI flag
      view.animatingScores = false;  // animation flag
      view.animatingButtons = false;  // animation flag
      loadView();

      function showGames(set) {  // eslint-disable-line
        if (view.expand == 'collapse')
          return false;
        // expand_set not longer supported.   Too confusing.
        // else if (view.expand == 'expand_set')
        //   return vm.scoreboard.sets.length <= 1 || vm.scoreboard.sets[0] == set;
        else // expand_all
          return true;
      }

      function keepingScore() {
        return vm.loggedIn && view.keepScore;
      }

      function toggleShowDetails() {
        view.showDetails = !view.showDetails
      }

      function viewData() {
        return {
          view: {
            expand: view.expand,
            keepScore: view.keepScore,
            showDetails: view.showDetails
          }
        }
      }

      function storeView() {
        $localStorage[DATANAME] = viewData();
      }

      function loadView() {
        var data = $localStorage[DATANAME] || {};
        if (data.view) {
          view.expand = data.view.expand;
          view.keepScore = data.view.keepScore;
          view.showDetails = data.view.showDetails;
        }
      }

      // Animation control
      function changingSetResult(set) {
        return set.newSet || set.newResult || set.updateScore
      }

      function changingSetTitle(set) {
        return set.newSet;
      }

      function changingGameTitle(game) {
        return game.newGame;
      }

      function changingGameResult(game) {
        return game.updateScore;
      }

      function changingMatchResult() {
        return vm.scoreboard.updateMatchScore;
      }

    }

    // prepare scoreboard for viewing
    function prepareScoreboard(sb, action, params) {

      scoreboardPrep(sb);
      insertMethods();
      // Reverse order of sets and games to
      // display most recent games at top of view.
      reverseOrder();

      // var builder = scoreboardPrep(sb);
      // // Add some properties to the score board object
      // insertValues();
      // insertMethods();
      // // Reverse order of sets and games to
      // // display most recent games at top of view.
      // reverseOrder();
      //
      // function insertValues() {
      //   sb.opponents = builder.opponents;
      //   sb.server = builder.server;
      //   // Add properies to scoreboard
      //   builder.insertScores();
      //   builder.insertSets();
      //   builder.insertTitles();
      //   builder.insertChangeState(action, params);
      //   // sb.buttonState = builder.buttonStatus;
      //   sb.matchContext = builder.matchContext;
      //   sb.currentGame = builder.currentGame;
      //   sb.previousGame = builder.previousGame;
      //   sb.currentSet = builder.currentSet;
      //   sb.previousSet = builder.previousSet;
      //   // sb.newGame = builder.newGame;
      //   // sb.newSet = builder.newSet;
      //   if (sb.currentGame && sb.currentGame.newGame) {
      //     var list = builder.listFirstServers();
      //     if (list) {
      //       sb.firstServers =
      //       {
      //         list: list,
      //         id: list[0].id
      //       };
      //     }
      //   }
      // }

      function insertMethods() {
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




