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
                      toggleClass, response) {
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

      authHelper(vm, $scope);
      loadingHelper(vm);
      toastrHelper(vm, $scope);

      if (angular.isDefined(response.id)) {
        applyResponseToScoreboard(response);
        vm.loadingHasCompleted();
      }
      else {
        $log.error('data error ' + response.status + " " + response.statusText);
        vm.loadingHasFailed(response);
      }
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

      var winAction = action.startsWith('win');
      var update = {
        action: action,
        param: param
        // changeGameScore: winAction,
        // changeLeftmost: param == 0,
        // changeMatchScore: function () {
        //   return winAction &&
        //     (!vm.scoreboard.currentSet && vm.scoreboard.previousSet && vm.scoreboard.previousSet.winner);
        // }
      };

      var promise = postUpdate(action, param);
      vm.view.animateScoreboardChanges(update, promise,
        function (response) {
          updating = false;
          applyResponseToScoreboard(response);
        },
        function (response) {
          updating = false;
          showError(response);
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
        var errors = errorsMapper(sb.errors, null);
        var message = 'Unable to update score';
        if (angular.isDefined(errors.other[0]))
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
      view.changed = storeView;

      view.animateScoreboardChanges = animateScoreboardChanges;
      view.updateScore = confirmScoreboardUpdate;
      view.disableAnimations = disableAnimations;
      view.keepingScore = keepingScore;
      view.toggleShowDescription = toggleShowDescription;
      view.toggleShowGames = toggleShowGames;
      view.toggleKeepScore = toggleKeepScore;

      view.animate = {
        showGames: false,
        description: true,
        playerServing: true,
        // keepingScore: true
      };

      var noAnimations = false;
      view.localDataName = DATANAME;
      view.showGames = false;
      view.keepScore = false;
      view.showDescription = false;
      loadView();

      function disableAnimations() {
        noAnimations = true;
      }

      function keepingScore() {
        return vm.loggedIn && view.keepScore;
      }

      function toggleShowDescription() {
        view.showDescription = !view.showDescription
        storeView();
      }

      function toggleShowGames() {
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
            }, view.showGames ? animationIntervals.in : animationIntervals.out);
          });
        }

        function toggle() {
          view.showGames = !view.showGames;
          storeView();
        }
      }

      function toggleKeepScore() {
        // if (noAnimations || view.animate.keepingScore) {
        //   toggle();
        // } else {
        //   view.animate.keepingScore = true;
        //   $timeout(function () {
        //     toggle();
        //     $timeout(function () {
        //       // Disable animation so that animation will not occur
        //       // when score table is refreshed
        //       view.animate.keepingScore = false;
        //     }, view.keepScore ? animationIntervals.in : animationIntervals.out);
        //   }, 1);
        // }
        //
        // function toggle() {
          view.keepScore = !view.keepScore;
          storeView();
        // }
      }

      function storeView() {

        var viewData = {
          view: {
            showGames: view.showGames,
            keepScore: view.keepScore,
            showDescription: view.showDescription
          }
        };

        $localStorage[DATANAME] = viewData;

      }

      function loadView() {
        var data = $localStorage[DATANAME] || {};
        if (data.view) {
          view.showGames = data.view.showGames;
          view.keepScore = data.view.keepScore;
          view.showDescription = data.view.showDescription;
        }
      }

      function animateScoreboardChanges(update, promise, accept, reject) {

        if (noAnimations) {
          promise.then(
            function (response) {
              accept(response)
            },
            function (response) {
              reject(response);
            }
          );
        }
        else {

          // Allow time for old data to hide
          var timerPromise = $timeout(function () {
          }, animationIntervals.out);

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
            });
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




