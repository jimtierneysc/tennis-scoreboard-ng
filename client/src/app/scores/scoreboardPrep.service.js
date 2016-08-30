/**
 * @ngdoc service
 * @name scoreboardPrep
 * @description
 * To make it easier to display and update the score, add more
 * properties to the scores object received from the backend.
 */

(function () {
  'use strict';

  angular
    .module('frontendScores')
    .factory('scoreboardPrep', factory);

  /** @ngInject */
  function factory(shortenName) {

    return function (sb) {
      prepare(sb, shortenName);
      return sb;
    };
  }

  // Add various properties to the scoreboard object in order to make it easier to write client
  // code and markup to display and alter the score.

  function prepare(sb, shortenName) {

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
    sb.matchFlags = {};
    sb.opponents = opponents();
    sb.server = server();
    insertScores(sb.opponents);
    insertFirsts();
    insertTitles();
    insertShortNames();
    sb.startingSetOrMatch = context.startingSetOrMatch;
    sb.currentGame = currentGame();
    sb.previousGame = previousGame();
    sb.currentSet = currentSet();
    sb.previousSet = previousSet();
    sb.hasCompletedGames = hasCompletedGames();
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
      if (context.inNewSet || context.inNewMatchTiebreak) {
        sb.sets.push(newSet());
      }
      if (context.inNewGame || context.inTiebreak) {
        var lastSet = sb.sets[sb.sets.length - 1];
        lastSet.games.push(newGame());
      }

      // Create newSet object if a set is starting
      function newSet() {
        var result = {
          newSet: true,
          games: []
        };
        if (context.inNewMatchTiebreak)
          result.tiebreak = true;
        return result;
      }

      // Create newGame object  if a game is starting
      function newGame() {
        var result = {newGame: true};
        if (context.inTiebreak)
          result.tiebreak = true;

        return result;
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
        lastGameOrTiebreak: null,
        prevGameOrTiebreak: null,
        lastSet: null,
        prevSet: null,
        lastGames: []
      };

      var lastGame = null;
      var lastGameInSet;
      var winner;

      enumerateSetsAndGames(
        function (set) {
          result.prevSet = result.lastSet;
          result.lastSet = set;
          lastGameInSet = null;
          winner = false;
        },
        function (game) {
          if (!game.tiebreak) {
            lastGame = game;
            lastGameInSet = game;
          }
          result.prevGameOrTiebreak = result.lastGameOrTiebreak;
          result.lastGameOrTiebreak = game;
          winner = winner || game.winner;
        },
        function (set) {
          result.lastGame = lastGame;
          result.lastGames.push(lastGameInSet);
          if (winner)
            result.lastSetWithWin = set;

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
        if (set.tiebreak)
          set.title = tieBreakTitle;
        else
          set.title = setsTitles[ordinal - 1];
      }

      function insertGameTitle(game, ordinal) {
        if (game.tiebreak)
          game.title = tieBreakTitle;
        else {
          game.title = ordinal.toString();
        }
      }
    }

    // Add properties to be used in views
    function insertScores(_opponents) {
      var matchScorePair = [0, 0];
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
            set.tiebreak = true;
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
        function () {
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

    function insertShortNames() {
      if (sb.doubles) {
        insertNames(sb.first_team);
        insertNames(sb.second_team)
      } else {
        insertName(sb.first_player);
        insertName(sb.second_player);
      }

      function insertName(player) {
        if (player)
          player.shortName = shortenName(player.name);
      }

      function insertNames(team) {
        if (team) {
          insertName(team.first_player);
          insertName(team.second_player);
        }
      }
    }

    function actionContext() {
      var result = {};

      if (sb.state != 'not_started' && sb.state != 'complete')
        result.playingMatch = true;
      if (sb.actions) {
        if (sb.actions.start_game || sb.actions.start_tiebreak)
          result.startingGame = true;
        else if (sb.actions.win_game || sb.actions.win_tiebreak || sb.actions.win_match_tiebreak)
          result.playingGame = true;
        if (sb.actions.start_game)
          result.inNewGame = true;
        if (sb.actions.start_tiebreak)
          result.inTiebreak = true;
        if (sb.actions.start_set)
          result.inNewSet = true;
        if (sb.actions.start_match_tiebreak)
          result.inNewMatchTiebreak = true;
        if (sb.actions.start_play || sb.actions.start_set || sb.actions.start_match_tiebreak)
          result.startingSetOrMatch = true;
      }
      return result;
    }

    function hasCompletedGames() {
      return [currentGame(), previousGame()].reduce(
        function (last, game) {
          return last || (game && game.winner);
        }, false);
    }

    function currentGame() {
      if (context.playingGame || context.startingGame)
        return setsAndGames.lastGameOrTiebreak;
    }

    function previousGame() {
      if (context.playingGame || context.startingGame)
        return setsAndGames.prevGameOrTiebreak;
      else
        return setsAndGames.lastGameOrTiebreak;
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
