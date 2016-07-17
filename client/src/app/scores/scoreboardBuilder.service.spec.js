(function () {
  'use strict';

  describe('service scoreboardBuilder', function () {

    beforeEach(module('frontend'));

    var service = null;

    beforeEach(function () {

      inject(function (_scoreboardBuilder_) {
        service = _scoreboardBuilder_;
      })
    });

    describe('members', function () {
      it('should have .opponents', function () {
        expect(service.opponents).toEqual(jasmine.any(Function));
      });
      it('should have .server', function () {
        expect(service.server).toEqual(jasmine.any(Function));
      });
      it('should have .insertScores', function () {
        expect(service.insertScores).toEqual(jasmine.any(Function));
      });
      it('should have .insertTitles', function () {
        expect(service.insertTitles).toEqual(jasmine.any(Function));
      });
      it('should have .buttonStatus', function () {
        expect(service.buttonStatus).toEqual(jasmine.any(Function));
      });
      it('should have .newGame', function () {
        expect(service.newGame).toEqual(jasmine.any(Function));
      });
      it('should have .newSet', function () {
        expect(service.newSet).toEqual(jasmine.any(Function));
      });
    })

    describe('.opponents()', function () {

      var doublesScore = {
        doubles: true,
        first_team: {id: 11},
        second_team: {id: 22}
      };

      var doublesExpected = [11, 22];

      var singlesScore = {
        doubles: false,
        first_player: {id: 33},
        second_player: {id: 44}
      };

      var singlesExpected = [33, 44];

      it('should build singles opponents', function () {
        expect(service.opponents(singlesScore)).toEqual(singlesExpected);
      });

      it('should build doubles opponents', function () {
        expect(service.opponents(doublesScore)).toEqual(doublesExpected);
      });
    });

    describe('.server()', function () {
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
        expect(service.server(scores)).toEqual(server);
      });

      it('should not have server when winner', function () {
        scores.sets[0].games[1].winner = server;
        expect(service.server(scores)).toEqual(null);
      });

      it('should not have server when no games', function () {
        scores.sets[0].games = [];
        expect(service.server(scores)).toEqual(null);
      });

      it('should not have server when no sets', function () {
        scores.sets = [];
        expect(service.server(scores)).toEqual(null);
      });

      it('should not have server when match not in progress ', function () {
        var scores = makeScores(complete);
        expect(service.server(scores)).toEqual(null);
      });
    });

    describe('.insertScores()', function () {
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
            service.insertScores(result);
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
            service.insertScores(result);
          });

          it('should add two winners', function () {
            expect(result.sets[0].scores).toEqual([1, 2]);
          });
        });
      });

      describe('match scores', function () {
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
            service.insertScores(result);
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
            service.insertScores(result);
          });

          it('should count match score', function () {
            expect(result.scores).toEqual([2, 1]);
          });
        });

      })

    });

    describe('.insertTitles()', function () {
      describe('game titles', function () {
        var result;
        var sample = {
          sets: [
            {
              games: [
                {}, {}, {tiebreaker: true}]
            }
          ]
        };
        beforeEach(function () {
          result = angular.copy(sample);
          service.insertTitles(result);
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

      describe('set titles', function () {
        var result;
        var sample = {
          sets: [
            {}, {}, {}, {}, {},
            {tiebreaker: true}
          ]
        };

        var titles = ['1st', '2nd', '3rd', '4th', '5th'];
        beforeEach(function () {
          result = angular.copy(sample);
          service.insertTitles(result);
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

    describe('.buttonStatus()', function () {
      describe('members', function () {
        var options;
        beforeEach(function () {
          options = service.buttonStatus({actions: {}});
        });

        it('should have .showWin', function () {
          expect(options.showWin).toEqual(jasmine.any(Boolean));
        });

        it('should have .customTitle', function () {
          expect(options.customTitle).not.toBe(undefined);
        });
      });
      describe('for', function () {
        var winGameActivity = {
          showGame: true,
          showWin: true,
          customTitle: null
        };
        var gameActivity = {
          showGame: true,
          showWin: false,
          customTitle: null
        };
        var setActivity = {
          showSet: true,
          showWin: false,
          customTitle: null
        };
        var matchActivity = {
          showMatch: true,
          showWin: false,
          customTitle: null
        };
        var winTiebreakerActivity = {
          showGame: true,
          showWin: true,
          customTitle: 'Tiebreak'
        };

        var actions = {
          win_game: winGameActivity,
          win_tiebreaker: winTiebreakerActivity,
          win_match_tiebreaker: winTiebreakerActivity,
          start_tiebreaker: gameActivity,
          start_game: gameActivity,
          start_set: setActivity,
          start_match_tiebreaker: setActivity,
          complete_match_tiebreaker: setActivity,
          complete_set_play: setActivity,
          complete_match_play: matchActivity,
          complete_set_tiebreaker: setActivity,
          start_play: matchActivity,
          restart_play: matchActivity
        };

        angular.forEach(actions, function (value, key) {
          describe('action ' + key, function () {
            it('should match expected value', function () {
              var actions = {};
              actions[key] = true;
              var options = service.buttonStatus({actions: actions})
              expect(options).toEqual(value);
            })
          });
        });
      });
    });

    describe('.newGame()', function () {

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

        var expectNewTiebreaker = {
          title: 'Tiebreak',
          set: sampleScores.sets[0]
        };

        var actions = {
          start_game: expectNewGame,
          start_tiebreaker: expectNewTiebreaker,
          win_game: null
        };

        function makeNewGame(action) {
          actions = {};
          actions[action] = true;
          var scores = angular.copy(sampleScores);
          scores.actions = actions;
          return service.newGame(scores);
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

              it('should have set', function () {
                expect(newGame.set).toEqual(sampleScores.sets[0]);
              });
            }
            else {
              it('shold not create new game', function () {
                expect(newGame).toBe(null);
              });
            }
          });
        });
      });
    });

    describe('.firstServers()', function () {
      describe('singles match', function () {
        var singles = {
          doubles: false,
          actions: {start_game: true},
          servers: [],
          sets: [
            {games: []}],
          first_player: {
            id: 1,
            name: "One"
          },
          second_player: {
            id: 2,
            name: "Two"
          }
        };
        var startSingles = [{
          id: 1,
          name: "One"
        },
          {
            id: 2,
            name: "Two"
          }];

        var scores;
        beforeEach(function () {
          scores = angular.copy(singles);
        });

        it('should have list when no server', function () {
          var firstServers = service.firstServers(scores)
          expect(firstServers).toEqual(startSingles)
        });

        it('should not have list when server', function () {
          scores.servers = [1];
          var firstServers = service.firstServers(scores);
          expect(firstServers).toBe(null);
        });
      });

      describe('doubles match', function () {
        var doubles = {
          doubles: true,
          actions: {start_game: true},
          servers: [],
          sets: [
            {games: []}],
          first_team: {
            first_player: {
              id: 1,
              name: "One"
            },
            second_player: {
              id: 2,
              name: "Two"
            }
          },
          second_team: {
            first_player: {
              id: 3,
              name: "Three"
            },
            second_player: {
              id: 4,
              name: "Four"
            }
          }
        };
        var allServers = [
          {
            id: 1,
            name: "One"
          }, {
            id: 2,
            name: "Two"
          },
          {
            id: 3,
            name: "Three"
          }, {
            id: 4,
            name: "Four"
          }
        ];

        var scores;
        beforeEach(function () {
          scores = angular.copy(doubles);
        });

        it('should list all when no server', function () {
          var firstServers = service.firstServers(scores)
          expect(firstServers).toEqual(allServers)
        });

        it('should list first team when one server', function () {
          scores.servers = [3];
          var servers = allServers.slice(0, 2);
          var firstServers = service.firstServers(scores);
          expect(firstServers).toEqual(servers);
        });

        it('should list second team when one server', function () {
          scores.servers = [1];
          var servers = allServers.slice(2, 4);
          var firstServers = service.firstServers(scores);
          expect(firstServers).toEqual(servers);
        });

        it('should not list when two servers', function () {
          scores.servers = [1, 3];
          var firstServers = service.firstServers(scores);
          expect(firstServers).toBe(null);
        });
      });
    });

    describe('.newSet', function () {
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
        var expectNewTiebreaker = {
          title: 'Tiebreak'
        };

        var actions = {
          start_set: expectNewSet,
          start_match_tiebreaker: expectNewTiebreaker,
          win_game: null
        };

        function makeNewSet(action) {
          actions = {};
          actions[action] = true;
          var scores = angular.copy(sampleScores);
          scores.actions = actions;
          return service.newSet(scores);
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

