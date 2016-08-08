(function () {
  'use strict';

  describe('service scoreboardPrep', function () {

    beforeEach(module('frontendScores'));

    var service = null;

    beforeEach(function () {

      inject(function (_scoreboardPrep_) {
        service = _scoreboardPrep_;
      })
    });

    describe('members', function () {
      var builder;
      beforeEach(function () {
        builder = {};
        service(builder);
      });

      it('should be a function', function () {
        expect(service).toEqual(jasmine.any(Function));
      });
      it('should have .opponents', function () {
        expect(builder.opponents).toEqual(jasmine.any(Object));
      });
      it('should have .server', function () {
        expect(builder.server).toEqual(jasmine.any(Object));
      });
      // it('should have .insertScores', function () {
      //   expect(builder.insertScores).toEqual(jasmine.any(Function));
      // });
      // it('should have .insertTitles', function () {
      //   expect(builder.insertTitles).toEqual(jasmine.any(Function));
      // });
      // it('should have .buttonStatus', function () {
      //   expect(builder.buttonStatus).toEqual(jasmine.any(Object));
      // });
      // it('should have .currentGame', function () {
      //   expect(builder.newGame).toEqual(jasmine.any(Object));
      // });
      // it('should have .newSet', function () {
      //   expect(builder.newSet).toEqual(jasmine.any(Object));
      // });
    });

    describe('.opponents', function () {

      describe('doubles', function () {
        var doublesScore = {
          doubles: true,
          first_team: {id: 11},
          second_team: {id: 22}
        };

        var doublesExpected = [11, 22];

        var builder;
        beforeEach(function () {
          builder = service(angular.copy(doublesScore));
        });

        it('should build opponents', function () {
          expect(builder.opponents).toEqual(doublesExpected);
        });
      });

      describe('singles', function () {

        var singlesScore = {
          doubles: false,
          first_player: {id: 33},
          second_player: {id: 44}
        };

        var singlesExpected = [33, 44];

        var builder;
        beforeEach(function () {
          builder = service(angular.copy(singlesScore));
        });

        it('should build opponents', function () {
          expect(builder.opponents).toEqual(singlesExpected);
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
            // builder.insertScores();
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
            service(result);
            // builder.insertScores();
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
            // builder.insertScores();
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
          ],
          actions: {}
        };
        beforeEach(function () {
          result = angular.copy(sample);
          service(result);
          // builder.insertTitles();
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
          service(result);
          // builder.insertTitles(result);
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

    // describe('.buttonStatus', function () {
    //   describe('for', function () {
    //     var winGameActivity = {
    //       show: {win: true}
    //     };
    //     var gameActivity = {
    //       show: {game: true}
    //     };
    //     var setActivity = {
    //       show: {set: true}
    //     };
    //     var matchActivity = {
    //       show: {match: true}
    //     };
    //     var winTiebreakerActivity = {
    //       show: {win: true}
    //     };
    //
    //     var actions = {
    //       win_game: winGameActivity,
    //       win_tiebreaker: winTiebreakerActivity,
    //       win_match_tiebreaker: winTiebreakerActivity,
    //       start_tiebreaker: gameActivity,
    //       start_game: gameActivity,
    //       start_set: setActivity,
    //       start_match_tiebreaker: setActivity,
    //       start_play: matchActivity,
    //       restart_play: matchActivity
    //     };
    //
    //     angular.forEach(actions, function (value, key) {
    //       describe('action ' + key, function () {
    //         it('should match expected value', function () {
    //           var actions = {};
    //           actions[key] = true;
    //           var builder = service({actions: actions});
    //           var status = builder.buttonStatus;
    //           expect(status).toEqual(value);
    //         })
    //       });
    //     });
    //   });
    // });
    //
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
          sets: [{games:[]}],
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

