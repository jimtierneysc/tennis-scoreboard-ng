/**
 * @ngdoc factory
 * @name scoreboardAnimateHideAndShow
 * @description
 * Set flags on the scoreboard object to trigger animations.
 */

(function () {
  'use strict';

  angular
    .module('frontendScores')
    .factory('scoreboardAnimate', factory);

  /** @ngInject */
  function factory(animationTimers) {

    return function (sb, action, param) {
      return new AnimateHideAndShow(sb, action, param, animationTimers);
    };
  }

  // Set and clear flags on the scoreboard object to trigger animation while
  // hiding and showing elements of the scoreboard view.
  // The scoreboard object must be prepared using the scoreboardPrep service, prior
  // to using this class.
  function AnimateHideAndShow(_sb_, _action_, _param_, _animationTimers_) {

    var sb = _sb_;
    var action = _action_;
    var param = _param_;
    var animationTimers = _animationTimers_;

    this.hideOldData = hideOldData;
    this.hideNewData = hideNewData;
    this.stopHideAndShow = stopHideAndShow;
    this.showNewData = showNewData;
    this.hideKeepScore = hideKeepScore;
    this.showKeepScore = showNewData;


    function hideOldData() {
      var actionState = new ActionState({oldData: true});

      sb.matchFlags.animatingProgress = true;
      sb.matchFlags.animatingServer = true;
      if (actionState.winningSet)
        sb.matchFlags.animatingResult = true;

      if (sb.currentGame && sb.currentSet) {

        if (actionState.winningGame && !actionState.winningSet)
          sb.currentGame.animatingTitle = true;

        if (actionState.winningGame)
          sb.currentSet.animatingResult = true;

        if (actionState.startingGame && sb.firstServers)
          sb.currentGame.animatingServersForm = true;

      }

      // Apply ng-class of elements before hide elements
      animationTimers.digest().then(function () {
        eachDataItem(
          function (item) {
            item.hiddenLeftmost = actionState.leftmost;
            setHidden(item, true);
          });
      });
    }

    function hideKeepScore() {
      sb.matchFlags.animatingProgress = true;
      sb.matchFlags.animatingServer = true;

      // if (sb.currentGame && sb.currentGame.newGame) {
      //   sb.currentGame.animating = true;
      // }

      if (sb.currentGame && !sb.currentGame.winner) {
        sb.currentGame.animating = true;
      }

      // Apply ng-class of elements before hide elements
      animationTimers.digest().then(function () {
        eachDataItem(
          function (item) {
            setHidden(item, true);
          });
      });
    }

    function hideNewData() {

      var actionState = new ActionState({oldData: false});

      sb.matchFlags.animatingProgress = true;
      sb.matchFlags.animatingServer = true;
      if (actionState.winningSet)
        sb.matchFlags.animatingResult = true;

      if (sb.currentGame && sb.currentSet) {
        if (actionState.startingGame)
          sb.currentGame.animatingWinButton = true;


        if (actionState.winningGame && sb.firstServers)
          sb.currentGame.animatingServersForm = true;


        if (actionState.winningGame && !actionState.winningSet) {
          // if (sb.currentGame) {
          sb.currentGame.animatingTitle = true;
          sb.currentGame.animatingStartGameButton = true;
          // }
          // if (sb.currentSet)
          sb.currentSet.animatingResult = true;
        }

        // Hide a newly created set and set's first game
        if ((actionState.startingSet || actionState.startingMatch) &&
          (!sb.currentGame.winner && sb.currentSet.games.length == 1)) {
          sb.currentGame.animating = true;
          sb.currentSet.animating = true;
        }
      }

      if (sb.currentGame && sb.previousGame) {
        // Hide game that just got a winner
        if (actionState.winningGame && sb.currentGame.newGame) {
          sb.currentGame.animatingTitle = true;
          sb.previousGame.animating = true;
        }
      }

      if (sb.previousSet) {
        if (actionState.winningSet) {
          // sb.matchFlags.animatingResult = true;
          // if (sb.previousSet)
          sb.previousSet.animatingResult = true;
        }
      }

      eachDataItem(
        function (item) {
          item.hiddenLeftmost = actionState.leftmost;
          setHidden(item, true);
        });
    }

    function showNewData() {
      eachDataItem(
        function (item) {
          setHidden(item, false);
        });
    }

    function stopHideAndShow() {
      eachDataItem(
        function (item) {
          setHidden(item, false);
          clearAnimating(item);
        });
    }

    function ActionState(data) {
      this.winningGame = winningGame(action);
      this.winningSet = data.oldData ? predictWinningSet() : winningSet();
      this.winningMatch = data.oldData ? predictWinningMatch() : winningMatch();
      this.startingGame = startingGame(action);
      this.startingSet = startingSet(action);
      this.startingMatch = action == 'start_play';
      this.leftmost = winningGame(action) ? param == 0 : undefined;

      function predictWinningSet() {
        var nearWinners = sb.near_winners.set;
        var opponent = sb.opponents[param];
        return winningGame() && nearWinners.indexOf(opponent) >= 0;
      }

      function predictWinningMatch() {
        var nearWinners = sb.near_winners.match;
        var opponent = sb.opponents[param];
        return winningGame() && nearWinners.indexOf(opponent) >= 0
      }

      function winningSet() {
        // if match is finished then must have won a set.
        // Otherwise, if there is a new set then the previous set was won
        return winningGame() && (sb.winner ||
          (sb.currentSet && sb.currentSet.newSet && sb.previousSet));
      }

      function winningMatch() {
        return winningGame() && sb.winner;
      }

      function winningGame() {
        return action && action.startsWith('win');
      }

      function startingSet() {
        return ['start_set', 'start_match_tiebreak', 'start_match'].indexOf(action) >= 0;
      }

      function startingGame() {
        return ['start_game', 'start_tiebreak'].indexOf(action) >= 0;
      }
    }

    // If item has a property that starts with "animating", set the corresponding
    // property that starts with "hidden" (e.g. if animatingTitle then set hiddenTitle).
    function setHidden(item, hidden) {
      angular.forEach(item, function (value, key) {
        if (key.startsWith('animating')) {
          item['hidden' + key.substr(9)] = hidden;
        }
      });

    }

    // Clear all properties that start with "animating"
    function clearAnimating(item) {
      angular.forEach(item, function (value, key) {
        if (key.startsWith('animating')) {
          item[key] = false;
        }
      });
    }

    // Enumerate all the items that may have animating* and hidden* properties.
    function eachDataItem(fn) {
      var items = [sb.previousGame, sb.currentGame, sb.currentSet, sb.previousSet, sb.matchFlags];
      angular.forEach(items,
        function (item) {
          if (item)
            fn(item)
        });
    }
  }

})();
