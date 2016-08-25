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
    
    return {
      animateAction: function(sb, action, param) {
        return new Animations(sb, animationTimers).animateAction(action, param);
      },
      animateKeepScore: function(sb, keepScore) {
        return new Animations(sb, animationTimers).animateKeepScore(keepScore);
      }
    }
  }

  // Set and clear flags on the scoreboard object to trigger animation while
  // hiding and showing elements of the scoreboard view.
  // The scoreboard object must be prepared using the scoreboardPrep service, prior
  // to using this class.
  function Animations(_sb_, _animationTimers_) {

    var sb = _sb_;
    var animationTimers = _animationTimers_;
    
    // Hide and show elements while changing the mode between keeping score and 
    // following score.
    this.animateKeepScore = function(keepScore) {
      return {
        hideChanging: function() {
          keepScoreHideChanging(keepScore);
        },
        hideChanged: function() {
          keepScoreHideChanged(!keepScore);
        },
        showChanged: showChanged,
        stop: stopHideAndShow
      }
    };

    // Hide and show elements while posting an action, like win_game
    this.animateAction = function(action, param) {
      return {
        hideChanging: function() {
          actionHideChanging(action, param);
        },
        hideChanged: function() {
          actionHideChanged(action, param)
        },
        showChanged: showChanged,
        stop: stopHideAndShow
      }
    };
    
    function actionHideChanging(action, param) {
      var transitions = new ScoreTransitions(action, param, {before: true});

      var list = new AnimationList();

      list.add('Progress', sb.matchFlags);
      list.add('Server', sb.matchFlags);

      if (transitions.winningSet)
        list.add('Result', sb.matchFlags);

      if (sb.currentGame && sb.currentSet) {

        if (transitions.winningGame && !transitions.winningSet)
          list.add('Title', sb.currentGame);

        if (transitions.winningGame)
          list.add('Result', sb.currentSet);

        if (transitions.startingGame && sb.firstServers)
          list.add('ServersForm', sb.currentGame);
      }

      enableAnimation(list);
      // Allow ng-class of elements to apply before hiding elements
      animationTimers.digest().then(function () {
        hideForAnimation(list, {leftmost: transitions.leftmost});
      });
    }

    function addKeepScoreGameAnimations(list, keepScore, game) {
      if (game.newGame) {
        list.add('', game, keepScore);
      } else if (!sb.currentGame.winner) {
        list.add('WinButton', game, keepScore);
        list.add('RowStatus', game, !keepScore);
      }
    }

    function keepScoreHideChanging(keepScore) {
      var list = new AnimationList();

      list.add('Progress', sb.matchFlags);
      if (sb.currentGame)
        addKeepScoreGameAnimations(list, keepScore, sb.currentGame);

      enableAnimation(list);
      // Allow ng-class to be applied
      animationTimers.digest().then(function () {
        hideForAnimation(list);
      });
    }

    function keepScoreHideChanged(keepScore) {
      var list = new AnimationList();

      list.add('Progress', sb.matchFlags);
      if (sb.currentGame)
        addKeepScoreGameAnimations(list, keepScore, sb.currentGame);
      hideForAnimation(list)
    }


    function actionHideChanged(action, param) {

      var transitions = new ScoreTransitions(action, param, {before: false});

      var list = new AnimationList();

      list.add('Progress', sb.matchFlags);
      list.add('Server', sb.matchFlags);

      if (transitions.winningSet)
        list.add('Result', sb.matchFlags);

      if (sb.currentGame && sb.currentSet) {
        if (transitions.startingGame)
          list.add('WinButton', sb.currentGame);

        if (transitions.winningGame && sb.firstServers)
          list.add('ServersForm', sb.currentGame);

        if (transitions.winningGame && !transitions.winningSet) {
          list.add('Title', sb.currentGame);
          list.add('StartGameButton', sb.currentGame);
          list.add('Result', sb.currentSet);
        }

        // Hide a newly created set and set's first game
        if ((transitions.startingSet || transitions.startingMatch) &&
          (!sb.currentGame.winner && sb.currentSet.games.length == 1)) {
          list.add('', sb.currentGame);
          list.add('', sb.currentSet);
        }
      }

      if (sb.currentGame && sb.previousGame) {
        // Hide game that just got a winner
        if (transitions.winningGame && sb.currentGame.newGame) {
          list.add('Title', sb.currentGame);
          list.add('', sb.previousGame);
        }
      }

      if (sb.previousSet) {
        if (transitions.winningSet)
          list.add('Result', sb.previousSet);
      }

      enableAnimation(list);
      hideForAnimation(list, {leftmost: transitions.leftmost});
    }

    function showChanged() {
      clearFlags(['hidden']);
    }

    function stopHideAndShow() {
      clearFlags(['hidden', 'animating']);
    }


    function AnimationList() {
      var items = [];
      this.items = items;
      this.add = function (key, value, hide) {
        if (angular.isUndefined(hide))
          hide = true;
        items.push({key: key, value: value, hide: hide});
      }
    }


    function clearFlags(prefixes) {
      eachFlaggedObject(
        function (item) {
          angular.forEach(prefixes, function (prefix) {
            clear(item, prefix)
          });
        });

      // Clear all properties that start with a prefix like "animating"
      function clear(item, prefix) {
        angular.forEach(item, function (value, key) {
          if (key.startsWith(prefix)) {
            item[key] = false;
          }
        });
      }
    }

    function enableAnimation(list) {
      angular.forEach(list.items, function (item) {
        // Set property such as animatingServersForm
        item.value['animating' + item.key] = true;
      });
    }

    function hideForAnimation(list, options) {
      options = options || {};
      var leftmost = options.leftmost;
      angular.forEach(list.items, function (item) {
        if (item.hide) {
          // Set property such as hiddenServersForm
          item.value['hidden' + item.key] = true;
          if (angular.isDefined(leftmost))
            item.value.hiddenLeftmost = leftmost;
        }
      });
    }

    // Enumerate all the objects that may have animating* and hidden* flags.
    function eachFlaggedObject(fn) {
      var items = [sb.previousGame, sb.currentGame, sb.currentSet, sb.previousSet, sb.matchFlags];
      angular.forEach(items,
        function (item) {
          if (item)
            fn(item)
        });
    }

    // Collect some information about the state of the scoreboard before or after executing
    // an action
    function ScoreTransitions(action, param, stateOf) {
      this.winningGame = winningGame(action);
      this.winningSet = stateOf.before ? predictWinningSet() : winningSet();
      this.winningMatch = stateOf.before ? predictWinningMatch() : winningMatch();
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
  }

})();
