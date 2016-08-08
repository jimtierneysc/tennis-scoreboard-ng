/**
 * @ngdoc factory
 * @name scoreboardPrep
 * @description
 * Build up scores object with information needed by controller/view
 *
 */

(function () {
  'use strict';

  angular
    .module('frontendScores')
    .factory('scoreboardPrep', factory);

  function factory() {
    return function (sb) {
      prep(sb);
      return sb;
    }
  }


  /** @ngInject */
  function prep(sb) {
    var tieBreakTitle = 'Tiebreak';
    var setsTitles = [
      '1st',
      '2nd',
      '3rd',
      '4th',
      '5th'
    ];


    var context = actionContext();

    // Add placeholder for a new set and new game to sets and games arrays
    insertNew();

    var setsAndGames = collectSetAndGames();

    // Add various properties
    sb.opponents = opponents();
    sb.server = server();
    insertScores(sb.opponents);
    insertFirsts();
    insertTitles();
    sb.currentGame = currentGame();
    sb.previousGame = previousGame();
    sb.currentSet = currentSet();
    sb.previousSet = previousSet();
    sb.firstServers = null;
    if (sb.currentGame && sb.currentGame.newGame) {
      var list = listFirstServers();
      if (list) {
        sb.firstServers =
        {
          list: list,
          id: list[0].id
        };
      }
    }

    function insertNew() {
      if (context.inNewSet || context.inNewMatchTiebreaker) {
        sb.sets.push(newSet());
      }
      if (context.inNewGame || context.inTiebreaker) {
        var lastSet = sb.sets[sb.sets.length - 1];
        lastSet.games.push(newGame());
      }

      // Create newSet object if a set is starting
      function newSet() {
        newSet = {
          newSet: true,
          games: []
        };
        if (context.inNewMatchTiebreaker)
          newSet.tiebreaker = true;
        return newSet;
      }

      // Create newGame object  if a game is starting
      function newGame() {
        newGame = {newGame: true};
        if (context.inTiebreaker)
          newGame.tiebreaker = true;

        return newGame;
      }
    }

    // Opponent pair
    function opponents() {
      // An opponent is either a player or a team
      var opponents = [];
      if (sb.doubles && sb.first_team)
        opponents = [sb.first_team.id, sb.second_team.id];
      else if (sb.first_player)
        opponents = [sb.first_player.id, sb.second_player.id];

      return opponents;
    }

    // Add server property
    function server() {
      var result = null;
      if (sb.state == 'in_progress') {
        var lastGame = setsAndGames.lastGame;
        if (lastGame && !lastGame.winner && lastGame.server)
          result = lastGame.server;
      }
      return result;
    }

    function collectSetAndGames() {
      var result = {
        lastGame: null,
        prevGame: null,
        lastTiebreaker: null,
        lastGameOrTiebreaker: null,
        lastSet: null,
        prevSet: null,
        lastGames: [],
        lastTiebreakers: []
      };

      var lastGame;
      var prevGame;
      var lastTiebreaker;

      enumerateSetsAndGames(
        function (set) {
          result.prevSet = result.lastSet;
          result.lastSet = set;
          lastGame = null;
          lastTiebreaker = null;
          prevGame = null;
        },
        function (game) {
          if (!game.tiebreaker) {
            prevGame = lastGame;
            lastGame = game;
          } else {
            lastTiebreaker = game;
          }
        },
        function (set) {
          result.lastGame = lastGame;
          result.prevGame = prevGame;
          result.lastTiebreaker = lastTiebreaker;
          result.lastTiebreakers.push(lastTiebreaker);
          result.lastGameOrTiebreaker = lastGame || lastTiebreaker;
          result.lastGames.push(lastGame);
        }
      );

      return result;
    }


    // Call functions for each game and set
    function enumerateSetsAndGames(onSet, onGame, onAfterGames) {
      var setOrdinal = 1;
      angular.forEach(sb.sets, function (set) {
        if (onSet)
          onSet(set, setOrdinal);
        setOrdinal++;
        var gameOrdinal = 1;
        angular.forEach(set.games, function (game) {
          if (onGame)
            onGame(game, gameOrdinal);
          gameOrdinal++;
        });
        if (onAfterGames) {
          onAfterGames(set, setOrdinal);
        }
      });
    }

    // Add properties to be used in views
    function insertTitles() {

      enumerateSetsAndGames(
        function (set, ordinal) {
          insertSetTitle(set, ordinal);
        },
        function (game, ordinal) {
          insertGameTitle(game, ordinal);
        }
      );

      var lastGames = setsAndGames.lastGames;
      for (var i = 0; i < lastGames.length; i++) {
        var game = lastGames[i];
        if (game)
          game.verboseTitle = true;
      }

      function insertSetTitle(set, ordinal) {
        if (set.tiebreaker)
          set.title = tieBreakTitle;
        else
          set.title = setsTitles[ordinal - 1];
      }

      function insertGameTitle(game, ordinal) {
        if (game.tiebreaker)
          game.title = tieBreakTitle;
        else {
          game.title = ordinal.toString();
        }
      }
    }

    // Add properties to be used in views
    function insertScores(_opponents) {
      var matchScorePair = [0, 0];
      // var setScorePairs = [];
      var setScorePair;

      function incScore(scoresPair, winner) {
        if (winner) {
          var i = _opponents.indexOf(winner);
          if (i >= 0)
            scoresPair[i] += 1;
        }
      }

      enumerateSetsAndGames(
        function (set) {
          setScorePair = [0, 0];
          incScore(matchScorePair, set.winner);
          if (set.scoring == 'ten_point')
            set.tiebreaker = true;
        },
        function (game) {
          incScore(setScorePair, game.winner);
        },
        function (set) {
          set.scores = setScorePair;
        }
      );

      sb.scores = matchScorePair;
    }

    function insertFirsts() {
      var firstOfMatch = true;
      var firstOfSet;
      enumerateSetsAndGames(
        function (_set_, ordinal) {
          firstOfSet = true;
        },
        function (game) {
          game.firstOfSet = firstOfSet;
          game.firstOfMatch = firstOfMatch;
          firstOfSet = false;
          firstOfMatch = false;
        }
      );
    }

    function insertChangeState(lastAction, lastActionParams) {

//       var winAction = lastAction && lastAction.startsWith('win_');
//       var startPlayAction = lastAction == 'start_play';
//       var startSetAction = lastAction == 'start_set';

//       var lastGame = setsAndGames.lastGame;
//       if (!lastGame)
//         lastGame = setsAndGames.lastTiebreaker;
//       var lastSet = setsAndGames.lastSet;

//       if (winAction) {
//         lastGame.updateScore = true;
//         lastSet.updateScore = true;
//         if (lastSet.state == 'complete') {
//           sb.updateMatchScore = true;
//         }
//       }
//       if (startPlayAction)
//         lastSet.newSet = true;
//       if (startSetAction)
//         lastSet.newResult = true;
    }


    function actionContext() {
      var result = {};

      if (sb.actions) {
        if (sb.actions.start_game || sb.actions.start_tiebreaker)
          result.startingGame = true;
        else if (sb.actions.win_game || sb.actions.win_tiebreaker || sb.actions.win_match_tiebreaker)
          result.playingGame = true;
        if (sb.state != 'not_started' && sb.state != 'complete')
          result.playingMatch = true;
        if (sb.actions.start_game)
          result.inNewGame = true;
        if (sb.actions.start_tiebreaker)
          result.inTiebreaker = true;
        if (sb.actions.start_set)
          result.inNewSet = true;
        if (sb.actions.start_match_tiebreaker)
          result.inNewMatchTiebreaker = true;
      }
      return result;
    }

    function currentGame() {
      if (context.playingGame || context.startingGame)
        return setsAndGames.lastGameOrTiebreaker;
    }

    function previousGame() {
      if (context.playingGame || context.startingGame)
        return setsAndGames.prevGame;
      else
        return setsAndGames.lastGameOrTiebreaker;
    }

    function currentSet() {
      if (context.playingMatch)
        return setsAndGames.lastSet;
    }

    function previousSet() {
      if (context.playingMatch)
        return setsAndGames.prevSet;
      else
        return setsAndGames.lastSet;
    }

    // List players to serve next game
    function listFirstServers() {
      if ((sb.doubles && sb.servers.length <= 1) || (!sb.doubles && sb.servers.length === 0))
        return listPlayers();
      else
        return null; // No more first servers

      function listPlayers() {
        var list = [];

        if (sb.doubles) {
          if (sb.servers.length == 1) {
            if ([sb.first_team.first_player.id,
                sb.first_team.second_player.id].indexOf(sb.servers[0]) >= 0) {
              addTeamPlayers([sb.second_team]);
            }
            else
              addTeamPlayers([sb.first_team]);
          }
          else
            addTeamPlayers([sb.first_team, sb.second_team]);
        }
        else
          addPlayers([sb.first_player, sb.second_player]);

        return list;

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
