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
                      scoreboardPrep, $timeout, animationIntervals,
                      response) {
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

      if (response.id) {
        applyResponseToScoreboard(response);
        vm.loadingHasCompleted();
      }
      else {
        $log.error('data error ' + response.status + " " + response.statusText);
        vm.loadingHasFailed(response);
      }
      vm.view.ready();
    }

    //
    // Internal methods
    //

    function confirmScoreboardUpdate(action, param, confirm) {
      vm.clearToast();

      var confirmActions = {
        discard_play: 'Confirm Clear Scoreboard'
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
      var update = {
        action: action,
        param: param
      };

      var promise = postUpdate(action, param);
      updating = true;
      vm.view.animateScoreboardChanges(update, promise,
        function (response) {
          applyResponseToScoreboard(response);
        },
        function (response) {
          showError(response);
        },
        function () {
          updating = false;
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
        return {match_score_board: params};
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
        vm.loadingHasFailed(response);
    }

    function View() {

      var DATANAME = 'scoreboardView';

      var view = this; // eslint-disable-line

      view.animateScoreboardChanges = animateScoreboardChanges;
      view.updateScore = confirmScoreboardUpdate;
      view.disableAnimations = disableAnimations;
      view.toggleShowDescription = toggleShowDescription;
      view.toggleShowGames = toggleShowGames;
      view.toggleKeepScore = toggleKeepScore;
      view.canShowGame = canShowGame;
      view.loggedInChanged = loggedInChanged;
      view.ready = ready;

      // Show hint first time win button is shown
      view.showWinButtonHint = true;

      view.keepingScore = false;
      view.animate = {
        showGames: false,
        description: true
      };

      var noAnimations = false;
      view.localDataName = function () {
        return DATANAME;
      };
      view.storeSettings = storeSettings;
      view.settings = {
        showGames: false,
        keepScore: false,
        showDescription: false
      };

      function ready() {
        loadSettings();
        updateKeepingScore();
      }

      function loggedInChanged() {
        if (view.settings.keepScore) {
          animateKeepScore(updateKeepingScore)
        }
        else {
          updateKeepingScore();
        }
      }

      function updateKeepingScore() {
        view.keepingScore = vm.loggedIn && view.settings.keepScore;
      }

      function disableAnimations() {
        noAnimations = true;
      }

      function toggleShowDescription() {
        view.settings.showDescription = !view.settings.showDescription;
        storeSettings();
      }

      function animateToggle(toggle, stage1, stage2, stop) {
        if (noAnimations) {
          toggle();
        } else {

          stage1();

          $timeout(function () {

            toggle();
            stage2();

            $timeout(function () {
              stop();
            }, animationIntervals.in);

          }, animationIntervals.out);
        }
      }

      function toggleShowGames(showGames) {
        if (showGames != view.settings.showGames) {
          if (!vm.scoreboard.hasCompletedGames) {
            toggle();
            if (showGames)
              vm.showToast('This setting has been changed, however there are no completed games to show',
                'Show Completed Games');
            else
              vm.showToast('This setting has been changed, however there are no completed games to hide',
                'Hide Completed Games');
          } else
            animateShowGames(toggle);
        }

        function toggle() {
          view.settings.showGames = showGames;
          storeSettings();
        }

      }

      function animateShowGames(toggle) {
        if (noAnimations) {
          toggle();
        } else {
          view.animate.showGames = true;
          $timeout(function () {
            toggle();
            $timeout(function () {
              // Disable animation so that animation will not occur
              // when score table is refreshed
              view.animate.showGames = false;
            }, view.settings.showGames ? animationIntervals.in : animationIntervals.out);
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

      function toggleKeepScore(keepScore) {

        if (!vm.loggedIn) {
          if (keepScore)
            vm.showToast('You must be logged in.', "Unable to Keep Score");
        } else {
          if (keepScore != view.keepingScore)
            animateKeepScore(toggle);
        }
        function toggle() {
          view.settings.keepScore = keepScore;
          storeSettings();
          updateKeepingScore();
        }
      }

      function animateKeepScore(toggle) {

        animateToggle(toggle, hide, show, stop);

        var hideAndShow;

        function hide() {
          hideAndShow = scoreboardPrep.hideAndShowData(vm.scoreboard);
          hideAndShow.hideKeepScore();
        }

        function show() {
          if (hideAndShow) hideAndShow.showKeepScore();
        }

        function stop() {
          if (hideAndShow) hideAndShow.stopHideAndShow();
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

      function animateScoreboardChanges(update, promise, accept, reject, final) {

        if (noAnimations) {
          promise.then(
            function (response) {
              accept(response)
            },
            function (response) {
              reject(response);
            }
          ).finally(final);
        }
        else {

          // Allow time for old data to hide
          var timerPromise = $timeout(animationIntervals.out);

          // Promise to wait until time has passed and post has finished
          var all = $q.all({timer: timerPromise, post: promise});

          // Create object to hide and show data during animation
          var hideAndShow = scoreboardPrep.hideAndShowData(vm.scoreboard, update.action, update.param);

          // Set flags so that old data will be hidden
          hideAndShow.hideOldData();

          // Wait for data to hide
          all.then(
            function (hash) {
              var response = hash.post;
              // Update scoreboard
              accept(response);

              // Set flags so that new data will be hidden, initially
              hideAndShow.hideNewData();
              if (update.action.startsWith('win')) {
                vm.view.showWinButtonHint = false;
              }

              // Let ng-class be processed
              $timeout(function () {
                // Show the new data
                hideAndShow.showNewData();
              });

              // Wait for new data to finish showing
              $timeout(function () {
                // Cleanup flags
                hideAndShow.stopHideAndShow();
              }, animationIntervals.in);

            },
            function (response) {
              reject(response);
              hideAndShow.stopHideAndShow();
            }).finally(final);
        }
      }
    }

    // prepare scoreboard for viewing
    function prepareScoreboard(sb) {

      scoreboardPrep.prepare(sb);
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




