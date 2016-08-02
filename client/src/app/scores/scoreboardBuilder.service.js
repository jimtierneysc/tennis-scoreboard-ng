/**
 * @ngdoc factory
 * @name scoreboardBuilder
 * @description
 * Build up scores object with information needed by controller/view
 *
 */

(function () {
  'use strict';

  angular
    .module('frontendScores')
    .service('scoreboardBuilder', ScoreboardBuilder);


  /** @ngInject */
  function ScoreboardBuilder() {
    var tieBreakTitle = 'Tiebreak'
    var setsTitles = [
      '1st',
      '2nd',
      '3rd',
      '4th',
      '5th'
    ];

    var _this = this;

    _this.opponents = opponents;
    _this.server = server;
    _this.insertScores = insertScores;
    _this.insertTitles = insertTitles;
    _this.buttonStatus = buttonStatus;
    _this.newGame = newGame;
    _this.firstServers = firstServers;
    _this.newSet = newSet;

    // Add opponents property
    function opponents(sb) {
      // An opponent is either a player or a team
      var opponents;
      if (sb.doubles)
        opponents = [sb.first_team.id, sb.second_team.id];
      else
        opponents = [sb.first_player.id, sb.second_player.id];

      return opponents;
    }

    // Add server property
    function server(sb) {
      var lastGame = null;
      if (sb.state == 'in_progress') {
        if (sb.sets.length > 0) {
          var lastSet = sb.sets[sb.sets.length - 1];
          if (lastSet.games.length > 0) {
            lastGame = lastSet.games[lastSet.games.length - 1];
          }
        }
      }
      if (lastGame && !lastGame.winner)
        return lastGame.server
      else
        return null;
    }

    // Insert running score to each set
    function insertScores(sb) {

      var _opponents = opponents(sb);

      function incScore(scores, value) {
        if (value.winner)
          scores[_opponents.indexOf(value.winner)] += 1;
      }

      // Add some properties to make rendering code simple
      var matchScore = [0, 0];
      angular.forEach(sb.sets, function (set) {
        incScore(matchScore, set);
        var setScore = [0, 0];

        angular.forEach(set.games, function (game) {
          incScore(setScore, game);
        });

        // Add a scores property to a set
        set.scores = setScore;
        if (set.scoring == 'ten_point')
          set.tiebreaker = true;
      });
      // Add a scores property to a match
      sb.scores = matchScore;

    }

    // Insert set and game titles
    function insertTitles(sb) {
      var setsCount = 0;

      // set titles and game titles properties
      angular.forEach(sb.sets, function (set) {
        setsCount++;
        if (set.tiebreaker)
          set.title = tieBreakTitle;
        else
          set.title = setsTitles[setsCount - 1];
        var gameCount = 0;
        var lastGame = null;
        angular.forEach(set.games, function (game) {
          gameCount++;
          if (game.tiebreaker)
            game.title = tieBreakTitle;
          else {
            lastGame = game;
            game.title = gameCount.toString();
          }
        });
        if (lastGame)
          lastGame.recentGame = true;
      });
    }

    function buttonStatus(sb) {

      var result = {
        showWin: (sb.actions.win_game || sb.actions.win_tiebreaker || sb.actions.win_match_tiebreaker) ? true : false,
        customTitle: sb.actions.win_tiebreaker || sb.actions.win_match_tiebreaker ? 'Tiebreak' : null
      };

      var show;
      if (sb.actions.win_game || sb.actions.win_tiebreaker || sb.actions.start_game ||
        sb.actions.start_tiebreaker || sb.actions.win_match_tiebreaker)
        show = 'showGame';
      else if (sb.actions.start_set || sb.actions.complete_set_play || sb.actions.start_match_tiebreaker ||
        sb.actions.complete_set_play || sb.actions.complete_match_tiebreaker || sb.actions.win_settiebreaker ||
        sb.actions.complete_set_tiebreaker)
        show = 'showSet';
      else
        show = 'showMatch';

      result[show] = true;
      return result;
    }

    // Create newGame object  if a game is starting
    function newGame(sb) {
      var newGame = null;
      if (sb.actions.start_tiebreaker || sb.actions.start_game) {
        newGame = {};
        var set = sb.sets[sb.sets.length - 1];
        newGame.set = set;
        if (sb.actions.start_tiebreaker) {
          newGame.title = tieBreakTitle;
          newGame.tiebreaker = true;
        }
        else {
          var nextGame = set.games.length + 1;
          newGame.title = nextGame.toString();
        }
      }

      return newGame;
    }


    // Create newSet object if a set is starting
    function newSet(sb) {
      var newSet = null;
      if (sb.actions.start_match_tiebreaker || sb.actions.start_set) {
        newSet = {};
        if (sb.actions.start_match_tiebreaker)
          newSet.title = tieBreakTitle;
        else {
          var nextSet = sb.sets.length + 1;
          newSet.title = setsTitles[nextSet - 1];
        }
      }
      return newSet;
    }

    // List players to serve next game
    function firstServers(sb) {
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
