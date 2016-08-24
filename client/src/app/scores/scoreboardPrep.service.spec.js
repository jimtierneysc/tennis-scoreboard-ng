(function () {
  'use strict';

  describe('scoreboardPrep service', function () {

    beforeEach(module('frontendScores'));

    var service;

    beforeEach(function () {

      inject(function (_scoreboardPrep_) {
        service = _scoreboardPrep_;
      })
    });
    
    describe('when prepared', function () {


      var scores;

      var sampleScore = {
        state: 'in_progress',
        actions: {'win_game': true},
        sets: []
      };

      function createSetCount(setCount, sample) {
        sample = sample || sampleScore;
        scores = angular.copy(sample);
        for (var i = 0; i < setCount; i++) {
          scores.sets.push({});
        }
        return scores;
      }

      function prepareSetCount(setCount, sample) {
        return service(createSetCount(setCount, sample));
      }

      function createGameCount(gameCount, sample) {
        sample = sample || sampleScore;
        scores = angular.copy(sample);
        if (gameCount > 0) {
          var set;
          if (sample.sets.length == 0) {
            set = {games: []};
            scores.sets.push(set);
          }
          else
            set = sample.sets[0];
          for (var i = 0; i < gameCount; i++) {
            set.games.push({});
          }
        }
        return scores;
      }

      function prepareGameCount(gameCount, sample) {
        return service(createGameCount(gameCount, sample));
      }

      describe('hasCompletedGames', function () {

        var scores;
        beforeEach(function () {
          scores = createGameCount(2);
        });

        it('should not have completed games when no winners', function () {
          service(scores);
          expect(scores.hasCompletedGames).toBeFalsy();
        });

        it('should have completed games when previous game winner', function () {
          scores.sets[0].games[0].winner = true;
          service(scores);
          expect(scores.hasCompletedGames).toBeTruthy();
        });

        it('should have completed games when currentGame winner', function () {
          scores.sets[0].games[1].winner = true;
          service(scores);
          expect(scores.hasCompletedGames).toBeTruthy();
        });

      });

      describe('.currentGame', function () {
        it('should not have current game when no games', function () {
          prepareGameCount(0);
          expect(scores.currentGame).toBeFalsy();
        });

        it('should have current game when one game', function () {
          prepareGameCount(1);
          expect(scores.currentGame).toBeTruthy();
        });

        it('should not have current game when not playing game', function () {
          var sample = angular.copy(sampleScore);
          sample.actions = {};
          prepareGameCount(1, sample);
          expect(scores.currentGame).toBeFalsy();
        });
      });

      describe('.previousGame', function () {
        it('should not have previous game when no games', function () {
          prepareGameCount(0);
          expect(scores.previousGame).toBeFalsy();
        });

        it('should not have previous game when one game', function () {
          prepareGameCount(1,
            angular.merge({}, {state: 'complete'}, sampleScore));
          expect(scores.previousGame).toBeFalsy();
        });

        it('should have previous game when two games', function () {
          prepareGameCount(2);
          expect(scores.previousGame).toBeTruthy();
        });

        it('should not have previous game when set complete', function () {
          prepareGameCount(1,
            angular.merge({}, sampleScore, {
              sets: [{
                winner: 1,
                games: []
              }]
            }));
          expect(scores.currentGame).toBeFalsy();
        });
      });

      describe('.currentSet', function () {
        it('should not have current set when no sets', function () {
          prepareSetCount(0);
          expect(scores.currentSet).toBeFalsy();
        });

        it('should have current set when one set', function () {
          prepareSetCount(1);
          expect(scores.currentSet).toBeTruthy();
        });

        it('should not have current set when complete', function () {
          prepareSetCount(1,
            angular.merge({}, sampleScore, {state: 'complete'}));
          expect(scores.currentSet).toBeFalsy();
        });

      });

      describe('.previousSet', function () {

        it('should not have previous set when no sets', function () {
          prepareSetCount(0);
          expect(scores.previousSet).toBeFalsy();
        });

        it('should not have previous set when one set', function () {
          prepareSetCount(1);
          expect(scores.previousSet).toBeFalsy();
        });

        it('should have previous set when complete', function () {
          prepareSetCount(1,  // Only one set
            angular.merge({}, sampleScore, {state: 'complete'}));
          expect(scores.previousSet).toBeTruthy();
        });

        it('should have previous set when two sets', function () {
          prepareSetCount(2);
          expect(scores.previousSet).toBeTruthy();
        });

      });
    });

    describe('.startingSetOrMatch', function () {
      var scores;

      function prepare(action) {
        var sampleScore = {
          sets: []
        };
        scores = angular.copy(sampleScore);
        scores.actions = {};
        scores.actions[action] = true;
        service(scores);
      }

      it('should not be starting', function () {
        prepare('win_game');
        expect(scores.startingSetOrMatch).toBeFalsy();
      });

      it('should be starting set', function () {
        prepare('start_set');
        expect(scores.startingSetOrMatch).toBeTruthy();
      });

      it('should be starting match', function () {
        prepare('start_play');
        expect(scores.startingSetOrMatch).toBeTruthy();
      });

    });

    describe('.opponents', function () {

      describe('doubles', function () {
        var doublesScore = {
          doubles: true,
          first_team: {id: 11},
          second_team: {id: 22}
        };

        var doublesExpected = [11, 22];

        var scores;
        beforeEach(function () {
          scores = service(angular.copy(doublesScore));
        });

        it('should build opponents', function () {
          expect(scores.opponents).toEqual(doublesExpected);
        });
      });

      describe('singles', function () {

        var singlesScore = {
          doubles: false,
          first_player: {id: 33},
          second_player: {id: 44}
        };

        var singlesExpected = [33, 44];

        var scores;
        beforeEach(function () {
          scores = service(angular.copy(singlesScore));
        });

        it('should build opponents', function () {
          expect(scores.opponents).toEqual(singlesExpected);
        });
      });
    });

    describe('.server', function () {
      var server = 3;
      var inProgress = 'in_progress';
      var complete = 'complete';

      function makeScores(state) {
        return {
          state: state,
          sets: [
            {
              games: [
                {},
                {
                  server: server
                }
              ]
            }
          ]
        };
      }

      var scores;
      beforeEach(function () {
        scores = makeScores(inProgress);
      });

      it('should have server when in_progress', function () {
        service(scores);
        expect(scores.server).toEqual(server);
      });

      it('should not have server when winner', function () {
        scores.sets[0].games[1].winner = server;
        service(scores);
        expect(scores.server).toEqual(null);
      });

      it('should not have server when no games', function () {
        scores.sets[0].games = [];
        service(scores);
        expect(scores.server).toEqual(null);
      });

      it('should not have server when no sets', function () {
        scores.sets = [];
        service(scores);
        expect(scores.server).toEqual(null);
      });

      it('should not have server when match not in progress ', function () {
        var scores = makeScores(complete);
        service(scores);
        expect(scores.server).toEqual(null);
      });
    });


    describe('inserted short names', function () {
      var names = [];
      var expected = [];
      for (var i = 0; i < 4; i++) {
        names.push('First' + i + ' ' + 'Last' + i);
        expected.push('First' + i + ' L.');
      }
      var singles = {
        doubles: false,
        first_player: {name: names[0]},
        second_player: {name: names[1]}
      };
      var doubles = {
        doubles: true,
        first_team: {
          first_player: {name: names[0]},
          second_player: {name: names[1]}
        },
        second_team: {
          first_player: {name: names[2]},
          second_player: {name: names[3]}
        }
      };

      describe('singles', function () {
        var result;
        beforeEach(function () {
          result = angular.copy(singles);
          service(result);
        });

        it('should shorten first player name', function () {
          expect(result.first_player.shortName).toEqual(expected[0]);
        });

        it('should shorten second player name', function () {
          expect(result.second_player.shortName).toEqual(expected[1]);
        });

      });

      describe('doubles', function () {
        var result;
        beforeEach(function () {
          result = angular.copy(doubles);
          service(result);
        });

        it('should shorten first player name', function () {
          expect(result.first_team.first_player.shortName).toEqual(expected[0]);
        });

        it('should shorten second player name', function () {
          expect(result.first_team.second_player.shortName).toEqual(expected[1]);
        });

        it('should shorten third player name', function () {
          expect(result.second_team.first_player.shortName).toEqual(expected[2]);
        });

        it('should shorten fourth player name', function () {
          expect(result.second_team.second_player.shortName).toEqual(expected[3]);
        });
      });

    });


    describe('inserted scores', function () {
      var singles = {
        doubles: false,
        first_player: {id: 1},
        second_player: {id: 2}
      };
      var doubles = {
        doubles: true,
        first_team: {id: 1},
        second_team: {id: 2}
      };
      describe('set scores', function () {
        var sets = [
          {
            games: [
              {
                winner: 1
              },
              {
                winner: 2
              },
              {
                winner: 2
              }
            ]
          },
          {
            games: [
              {
                winner: 2
              },
              {
                winner: 2
              }
            ]
          },
          {
            scoring: 'ten_point',
            games: [
              {
                winner: null
              }
            ]
          },
          {
            winner: 1,
            games: [
              {}
            ]
          }
        ];

        describe('singles', function () {
          var result;
          beforeEach(function () {
            result = angular.copy(singles);
            result.sets = angular.copy(sets);
            service(result);
          });

          it('should add two winners', function () {
            expect(result.sets[0].scores).toEqual([1, 2]);
          });

          it('should add one winner', function () {
            expect(result.sets[1].scores).toEqual([0, 2]);
          });

          it('should add no winner', function () {
            expect(result.sets[2].scores).toEqual([0, 0]);
          });

          it('should add empty set', function () {
            expect(result.sets[3].scores).toEqual([0, 0]);
          });
        });

        describe('doubles', function () {
          var result;
          beforeEach(function () {
            result = angular.copy(doubles);
            result.sets = angular.copy(sets);
            service(result);
            // scores.insertScores();
          });

          it('should add two winners', function () {
            expect(result.sets[0].scores).toEqual([1, 2]);
          });
        });
      });

      describe('match', function () {
        var sets = [
          {
            winner: 1
          },
          {
            winner: 2
          },
          {
            winner: 1
          },
          {
            winner: null
          },
          {}
        ];

        describe('singles', function () {
          var result;
          beforeEach(function () {
            result = angular.copy(singles);
            result.sets = angular.copy(sets);
            service(result);
          });

          it('should count match score', function () {
            expect(result.scores).toEqual([2, 1]);
          });
        });

        describe('doubles', function () {
          var result;
          beforeEach(function () {
            result = angular.copy(doubles);
            result.sets = angular.copy(sets);
            service(result);
          });

          it('should count match score', function () {
            expect(result.scores).toEqual([2, 1]);
          });
        });
      })
    });

    describe('inserted titles', function () {
      describe('game', function () {
        var result;
        var sample = {
          sets: [
            {
              games: [
                {}, {}, {tiebreak: true}]
            }
          ],
          actions: {}
        };
        beforeEach(function () {
          result = angular.copy(sample);
          service(result);
        });

        it('should have game 1 title', function () {
          expect(result.sets[0].games[0].title).toEqual('1');
        });
        it('should have game 2 title', function () {
          expect(result.sets[0].games[1].title).toEqual('2');
        });
        it('should have tiebreak title', function () {
          expect(result.sets[0].games[2].title).toEqual('Tiebreak');
        });
      });

      describe('set', function () {
        var result;
        var sample = {
          sets: [
            {}, {}, {}, {}, {},
            {tiebreak: true}
          ]
        };

        var titles = ['1st', '2nd', '3rd', '4th', '5th'];
        beforeEach(function () {
          result = angular.copy(sample);
          service(result);
        });

        for (var i = 1; i <= 4; i++) {
          it('should have set ' + i + ' title', function () {
            expect(result.sets[i - 1].title).toEqual(titles[i - 1]);
          });
        }
        it('should have tiebreak title', function () {
          expect(result.sets[5].title).toEqual('Tiebreak');
        });
      });
    });

    describe('new game', function () {

      describe('for', function () {
        var sampleScores = {
          doubles: false,
          actions: actions,
          servers: [1],
          sets: [
            {games: []}]
        };

        var expectNewGame = {
          title: '1',
          set: sampleScores.sets[0]
        };

        var expectNewTiebreak = {
          title: 'Tiebreak',
          set: sampleScores.sets[0]
        };

        var actions = {
          start_game: expectNewGame,
          start_tiebreak: expectNewTiebreak,
          win_game: null
        };

        function makeNewGame(action) {
          actions = {};
          actions[action] = true;
          var scores = angular.copy(sampleScores);
          scores.actions = actions;
          service(scores);
          return scores.currentGame && scores.currentGame.newGame ? scores.currentGame : null;
        }

        angular.forEach(actions, function (value, key) {
          describe(key + ' action', function () {
            var newGame;
            beforeEach(function () {
              newGame = makeNewGame(key);
            });

            if (value) {
              it('should create new game', function () {
                expect(newGame).not.toBe(null);
              });

              it('should have title', function () {
                expect(newGame.title).toEqual(value.title);
              });

            }
            else {
              it('should not create new game', function () {
                expect(newGame).toBe(null);
              });
            }
          });
        });
      });
    });

    describe('.firstServers', function () {
      describe('singles match', function () {
        var singles = {
          doubles: false,
          actions: {start_game: true},
          servers: [],
          sets: [
            {games: []}],
          first_player: {
            id: 10
          },
          second_player: {
            id: 20
          }
        };
        var allServerIds = [10, 20];

        var scores;
        beforeEach(function () {
          scores = angular.copy(singles);
        });

        it('should have list when no server', function () {
          service(scores);
          var list = scores.firstServers.list;
          expect(list.length).toEqual(allServerIds.length)
        });

        it('should not have list when server', function () {
          scores.servers = [1];
          service(scores);
          var list = scores.firstServers;
          expect(list).toBe(null);
        });
      });

      describe('doubles match', function () {
        var doubles = {
          doubles: true,
          sets: [{games: []}],
          actions: {start_game: true},
          servers: [],
          first_team: {
            first_player: {
              id: 10
            },
            second_player: {
              id: 20
            }
          },
          second_team: {
            first_player: {
              id: 30
            },
            second_player: {
              id: 40
            }
          }
        };
        var allServerIds = [10, 20, 30, 40];

        var scores;
        beforeEach(function () {
          scores = angular.copy(doubles);
        });

        it('should list all when no server', function () {
          service(scores);
          var list = scores.firstServers.list;
          expect(list.length).toEqual(allServerIds.length)
        });

        describe('when one server', function () {
          var firstTeamServers;
          var secondTeamServers;
          beforeEach(function () {
            firstTeamServers = allServerIds.slice(0, 2);
            secondTeamServers = allServerIds.slice(2, 4);
          });

          for (var i = 0; i < 4; i++) {
            describe('is player ' + (i + 1), function () {
              var firstServers;
              var index = i;  // capture i
              beforeEach(function () {
                scores.servers = [allServerIds[index]];
                service(scores);
                firstServers = scores.firstServers.list;
              });

              it('should list two servers', function () {
                expect(firstServers.length).toBe(2);
              });

              it('should list correct servers', function () {
                var expected = index > 1 ? firstTeamServers : secondTeamServers;
                expect([firstServers[0].id, firstServers[1].id]).toEqual(expected);
              });
            });
          }
        });

        it('should list none when two servers', function () {
          scores.servers = [0, 0];
          service(scores);
          var list = scores.firstServers;
          expect(list).toBe(null);
        });
      });
    });

    describe('new set', function () {
      describe('for', function () {
        var sampleScores = {
          actions: actions,
          servers: [1],
          sets: [
            {games: []}]
        };

        var expectNewSet = {
          title: '2nd'
        };
        var expectNewTiebreak = {
          title: 'Tiebreak'
        };

        var actions = {
          start_set: expectNewSet,
          start_match_tiebreak: expectNewTiebreak,
          win_game: null
        };

        function makeNewSet(action) {
          actions = {};
          actions[action] = true;
          var scores = angular.copy(sampleScores);
          scores.actions = actions;
          service(scores);
          return scores.currentSet && scores.currentSet.newSet ? scores.currentSet : null;
        }

        angular.forEach(actions, function (value, key) {
          describe(key + ' action', function () {
            var newSet;
            beforeEach(function () {
              newSet = makeNewSet(key);
            });

            if (value) {
              it('should create new set', function () {
                expect(newSet).not.toBe(null);
              });

              it('should have title', function () {
                expect(newSet.title).toEqual(value.title);
              });
            }
            else {
              it('should not create new set', function () {
                expect(newSet).toBe(null);
              });
            }
          });
        });
      });
    });

  })
})();

