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
                      authHelper, toastrHelper, $q,
                      scoreboardPrep, scoreboardAnimate,
                      animateChange, response) {
    var vm = this;
    var updating = false;

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

      authHelper(vm, $scope, vm.view.loggedInChanged);
      loadingHelper(vm);
      toastrHelper(vm, $scope);

      vm.view.loadSettings();

      if (response.id) {
        applyResponseToScoreboard(response);
        vm.loading.hasCompleted();
      }
      else {
        $log.error('data error ' + response.status + " " + response.statusText);
        vm.loading.hasFailed(response);
      }
    }

    function confirmScoreboardUpdate(action, param) {
      vm.clearToast();

      if (action == 'discard_play') {
        modalConfirm.confirm({
          title: 'Confirm Clear', text: 'Are you sure you want to clear all games from match "' +
          vm.scoreboard.title + '"?'
        })
          .then(function () {
            scoreboardUpdate(action, param);
          });
      }
      else {
        scoreboardUpdate(action, param);
      }
    }

    function scoreboardUpdate(action, param) {

      if (updating)  // Prevent re-enter
        return;

      var promise = postUpdate(action, param);
      updating = true;
      vm.view.animateScoreboardUpdate(action, param, promise,
        function (response) {
          applyResponseToScoreboard(response);
        },
        function (response) {
          showError(response);
        },
        function () {
          updating = false;
          if (action.startsWith('win')) {
            // User has clicked win button
            vm.view.showWinButtonHint = false;
          }
        });
    }

    function postUpdate(action, param) {
      var key = {id: vm.id};
      var body = makePostBody(action, param);
      var deferred = $q.defer();
      crudResource.getResource(scoreboardPath).save(key, body,
        function (response) {
          deferred.resolve(response);
        },
        function (response) {
          $log.error('update error ' + response.status + " " + response.statusText);
          deferred.reject(response);
        }
      );
      return deferred.promise;

      function makePostBody(action, id) {
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
        return {match_scoreboard: params};
      }
    }

    function applyResponseToScoreboard(response) {
      var sb = response;
      if (sb.errors && !angular.equals({}, sb.errors)) {
        var errors = errorsMapper(sb.errors);
        var message = 'Unable to update score';
        if (errors.other[0])
          message = errors.other[0];
        vm.showToast(message)
      }
      angular.copy(sb, vm.scoreboard);
      prepareScoreboard(vm.scoreboard);
    }

    function showError(response) {
      if (!vm.showHttpErrorToast(response.status))
        vm.loading.hasFailed(response);
    }

    function View() {

      var DATANAME = 'scoreboardView';

      var view = this; // eslint-disable-line

      view.animateScoreboardUpdate = animateScoreboardUpdate;
      view.updateScore = confirmScoreboardUpdate;
      view.toggleShowDescription = toggleShowDescription;
      view.toggleShowGames = toggleShowGames;
      view.toggleKeepingScore = toggleKeepingScore;
      view.canShowGame = canShowGame;
      view.loggedInChanged = loggedInChanged;
      view.loadSettings = function () {
        loadSettings();
        updateKeepingScore();
      };

      // Show hint first time win button is shown
      view.showWinButtonHint = true;

      view.keepingScore = false;
      view.animate = {
        showGames: false,
        description: true
      };

      view.localDataName = function () {
        return DATANAME;
      };
      view.storeSettings = storeSettings;
      view.settings = {
        showGames: false,
        keepScore: true,
        showDescription: false
      };

      function loggedInChanged() {
        if (view.settings.keepScore)
          animateKeepScore(updateKeepingScore);
        else
          updateKeepingScore();
      }

      function updateKeepingScore() {
        view.keepingScore = vm.loggedIn && view.settings.keepScore;
      }

      function toggleShowDescription(showDescription) {
        if (showDescription != view.settings.showDescription) {
          view.settings.showDescription = !view.settings.showDescription;
          storeSettings();
        }
      }
      
      function toggleShowGames(showGames) {
        if (showGames != view.settings.showGames) {
          if (!vm.scoreboard.hasCompletedGames) {
            toggle();
            var title = 'Show Completed Games';
            if (showGames)
              vm.showToast('This setting has been turned on, however there are no completed games to show',
                title);
            else
              vm.showToast('This setting has been turned off, however there are no completed games to hide',
                title);
          } else
            animateShowGames();
        }

        function toggle() {
          view.settings.showGames = showGames;
          storeSettings();
          return view.settings.showGames;
        }

        function animateShowGames() {

          animateChange.toggleShow(toggle,
            function () {
              // Hide before change
              view.animate.showGames = true;
            },
            function () {
              // Show after change
              view.animate.showGames = false;
            });
        }
      }

      // Indicate when to show a game in the score table.
      // Depends on whether user is keeping score or following score, and
      // whether sets and games are shown or just sets,
      function canShowGame(game) {
        return (view.settings.showGames && !game.newGame) ||
          (!game.winner && !game.newGame) ||
          (game.newGame && view.keepingScore)
      }

      function toggleKeepingScore(keepScore) {

        if (!vm.loggedIn) {
          vm.showToast('You must be logged in order to keep score.', "Unable to Show Score Keeper Commands");
          keepScore = true;
          toggle();  // Now score keeper commands will show in case the user logs in later
        } else {
          if (keepScore != view.keepingScore) {
            if (vm.scoreboard.winner) {
              toggle();
              var title = 'Show Score Keeper Commands';
              if (view.keepingScore)
                vm.showToast('This setting has been turned on, however there are no commands to show because the match is over',
                  title);
              else
                vm.showToast('This setting has been turned off, however there are no commands to hide because the match is over',
                  title);
            }
            else
              animateKeepScore(toggle);
          }
        }

        function toggle() {
          view.settings.keepScore = keepScore;
          storeSettings();
          updateKeepingScore();
        }
      }

      function storeSettings() {

        var viewData = {
          settings: {
            showGames: view.settings.showGames,
            keepScore: view.settings.keepScore,
            showDescription: view.settings.showDescription
          }
        };

        $localStorage[DATANAME] = viewData;
      }

      function loadSettings() {
        var data = $localStorage[DATANAME] || {};
        if (data.settings) {
          view.settings.showGames = data.settings.showGames;
          view.settings.keepScore = data.settings.keepScore;
          view.settings.showDescription = data.settings.showDescription;
        }
      }

      function animateKeepScore(toggle) {
        var hideAndShow = scoreboardAnimate.animateKeepScore(vm.scoreboard, view.keepingScore);

        animateChange.hideThenShow(toggle, hideAndShow);
      }

      function animateScoreboardUpdate(action, param, promise, accept, reject, final) {
        var hideAndShow = scoreboardAnimate.animateAction(vm.scoreboard, action, param);

        animateChange.promiseHideThenShow(promise, accept, hideAndShow, reject, final);
      }
    }


    // prepare scoreboard for viewing
    function prepareScoreboard(sb) {

      scoreboardPrep(sb);
      // Reverse order of sets and games to
      // display most recent games at top of view.
      reverseOrder();

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




