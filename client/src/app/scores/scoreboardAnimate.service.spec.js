(function () {
  'use strict';

  describe('scoreboardAnimate service', function () {

    beforeEach(module('frontendScores'));

    var service;
    var $timeout;
    var scoreboardPrep;

    beforeEach(function () {

      inject(function (_scoreboardAnimate_, _scoreboardPrep_, _$timeout_) {
        service = _scoreboardAnimate_;
        scoreboardPrep = _scoreboardPrep_;
        $timeout = _$timeout_;
      })
    });

    describe('members', function () {
      it('should be an function', function () {
        expect(service).toEqual(jasmine.any(Function));
      });
    });

    describe('.hideAndShowData()', function () {

      var hideAndShow;
      var scores;

      var sampleScores = {
        state: 'in_progress',
        first_player: {id: 100},
        second_player: {id: 200},
        servers: [],
        near_winners: {
          set: [],
          match: []
        },
        sets: [
          {
            games: [
              {}
            ]
          }
        ]
      };


      function createHideAndShow(sample, action, param) {
        sample = sample || sampleScores;
        action = action || 'some_action';
        scores = scoreboardPrep(angular.copy(sample));
        hideAndShow = service(scores, action, param);
      }

      describe('members', function () {
        beforeEach(function () {
          createHideAndShow();
        });

        it('should have .hideOldData()', function () {
          expect(hideAndShow.hideOldData).toEqual(jasmine.any(Function));
        });

        it('should have .hideNewData()', function () {
          expect(hideAndShow.hideNewData).toEqual(jasmine.any(Function));
        });

        it('should have .stopHideAndShow()', function () {
          expect(hideAndShow.stopHideAndShow).toEqual(jasmine.any(Function));
        });

        it('should have .showNewData()', function () {
          expect(hideAndShow.showNewData).toEqual(jasmine.any(Function));
        });

      });

      describe('.hideOldData()', function () {

        var winGame;
        (function () {
          winGame = angular.copy(sampleScores);
          winGame.actions = {'win_game': true};
        })();

        var nearWinSet;
        (function () {
          nearWinSet = angular.copy(winGame);
          nearWinSet.actions = {'win_game': true};
          nearWinSet.near_winners.set =
            [nearWinSet.first_player.id, nearWinSet.second_player.id];
        })();

        var nearWinMatch;
        (function () {
          nearWinMatch = angular.copy(nearWinSet);
          nearWinMatch.near_winners.match =
            nearWinMatch.near_winners.set;
        })();

        describe('hides match score when winning set', function () {

          it('should not be hidden initially', function () {
            createHideAndShow(winGame);
            expect(scores.matchFlags.hiddenResult).toBeFalsy();
          });

          describe('left side', function () {
            beforeEach(function () {
              createHideAndShow(nearWinMatch, 'win_game', 0);
              hideAndShow.hideOldData();
              $timeout.flush();
            });

            it('should hide result', function () {
              expect(scores.matchFlags.hiddenResult).toBeTruthy();
            });

            it('should hide left', function () {
              expect(scores.matchFlags.hiddenLeftmost).toBeTruthy();
            });

          });

          describe('right side', function () {
            beforeEach(function () {
              createHideAndShow(nearWinMatch, 'win_game', 1);
              hideAndShow.hideOldData();
              $timeout.flush();
            });

            it('should hide result', function () {
              expect(scores.matchFlags.hiddenResult).toBeTruthy();
            });

            it('should hide right', function () {
              expect(scores.matchFlags.hiddenLeftmost).toBeFalsy();
            });
          });
        });

        describe('hides set score when winning game', function () {

          it('should not be hidden initially', function () {
            createHideAndShow(winGame);
            expect(scores.currentSet.hiddenResult).toBeFalsy();
          });

          describe('left', function () {
            beforeEach(function () {
              createHideAndShow(nearWinSet, 'win_game', 0);
              hideAndShow.hideOldData();
              $timeout.flush();
            });

            it('should hide result', function () {
              expect(scores.currentSet.hiddenResult).toBeTruthy();
            });

            it('should hide left', function () {
              expect(scores.currentSet.hiddenLeftmost).toBeTruthy();
            });
          });

          describe('right', function () {
            beforeEach(function () {
              createHideAndShow(nearWinSet, 'win_game', 1);
              hideAndShow.hideOldData();
              $timeout.flush();
            });

            it('should hide result', function () {
              expect(scores.currentSet.hiddenResult).toBeTruthy();
            });

            it('should hide right', function () {
              expect(scores.currentSet.hiddenLeftmost).toBeFalsy();
            });
          });
        });

        describe('hides game title when winning game', function () {

          it('should not be hidden initially', function () {
            createHideAndShow(winGame);
            expect(scores.currentGame.hiddenTitle).toBeFalsy();
          });

          describe('hide', function () {
            beforeEach(function () {
              createHideAndShow(winGame, 'win_game', 0);
              hideAndShow.hideOldData();
              $timeout.flush();
            });

            it('should hide title', function () {
              expect(scores.currentGame.hiddenTitle).toBeTruthy();
            });
          });
        });

        describe('hides progress for any action', function () {
          beforeEach(function () {
            createHideAndShow();
          });

          it('should not be hidden initially', function () {
            expect(scores.matchFlags.hiddenProgress).toBeFalsy();
          });

          it('should be hidden', function () {
            hideAndShow.hideOldData();
            $timeout.flush();
            expect(scores.matchFlags.hiddenProgress).toBeTruthy();
          })
        });
      });

      describe('.hideNewData()', function () {
        var startGame;
        (function () {
          startGame = angular.copy(sampleScores);
          startGame.actions = {'start_game': true};
        })();

        describe('hides match score', function () {

          describe('when win match', function () {

            var winMatch;
            (function () {
              winMatch = angular.copy(sampleScores);
              winMatch.winner = 1;
            })();

            describe('left', function () {
              beforeEach(function () {
                createHideAndShow(winMatch, 'win_game', 0);
                hideAndShow.hideNewData();
              });

              it('should hide result', function () {
                expect(scores.matchFlags.hiddenResult).toBeTruthy();
              });

              it('should hide left', function () {
                expect(scores.matchFlags.hiddenLeftmost).toBeTruthy();
              });

            });

            describe('right', function () {
              beforeEach(function () {
                createHideAndShow(winMatch, 'win_game', 1);
                hideAndShow.hideNewData();
              });

              it('should hide result', function () {
                expect(scores.matchFlags.hiddenResult).toBeTruthy();
              });

              it('should hide right', function () {
                expect(scores.matchFlags.hiddenLeftmost).toBeFalsy();
              });
            });
          });

          describe('when win set', function () {
            var winSet;
            (function () {
              winSet = angular.copy(sampleScores);
              winSet.actions = {'start_set': true};
              winSet.sets[0].winner = 1;
            })();

            beforeEach(function () {
              createHideAndShow(winSet, 'win_game', 0);
              hideAndShow.hideNewData();
            });

            it('should hide result', function () {
              expect(scores.matchFlags.hiddenResult).toBeTruthy();
            });

          });
        });

        describe('hides set score', function () {

          describe('when start game in current set', function () {

            describe('left', function () {
              beforeEach(function () {
                createHideAndShow(startGame, 'win_game', 0);
                hideAndShow.hideNewData();
              });

              it('should hide result of current set', function () {
                expect(scores.currentSet.hiddenResult).toBeTruthy();
              });

              it('should hide left', function () {
                expect(scores.currentSet.hiddenLeftmost).toBeTruthy();
              });
            });

            describe('right', function () {
              beforeEach(function () {
                createHideAndShow(startGame, 'win_game', 1);
                hideAndShow.hideNewData();
              });

              it('should hide result of current set', function () {
                expect(scores.currentSet.hiddenResult).toBeTruthy();
              });

              it('should hide right', function () {
                expect(scores.currentSet.hiddenLeftmost).toBeFalsy();
              });
            })
          });

          describe('when start second set', function () {
            var startSecondSet;
            (function () {
              startSecondSet = angular.copy(sampleScores);
              startSecondSet.sets =
                [
                  {winner: 1, games: []}
                ];
              startSecondSet.actions = {'start_set': true};
            })();

            beforeEach(function () {
              createHideAndShow(startSecondSet, 'win_game', 1);
              hideAndShow.hideNewData();
            });

            it('should hide result of previous set', function () {
              expect(scores.previousSet.hiddenResult).toBeTruthy();
            });
          });
        });

        describe('hides game title', function () {

          it('should not be hidden initially', function () {
            createHideAndShow(startGame);
            expect(scores.currentGame.hiddenTitle).toBeFalsy();
          });

          describe('hides when start game', function () {
            beforeEach(function () {
              createHideAndShow(startGame, 'win_game', 0);
              hideAndShow.hideNewData();
            });

            it('should hide title', function () {
              expect(scores.currentGame.hiddenTitle).toBeTruthy();
            });
          });
        });

        describe('hides progress for any action', function () {
          beforeEach(function () {
            createHideAndShow();
          });

          it('should be hidden', function () {
            hideAndShow.hideNewData();
            expect(scores.matchFlags.hiddenProgress).toBeTruthy();
          })
        });

        describe('hides game after win', function () {
          var winGame;
          (function () {
            winGame = angular.copy(sampleScores);
            winGame.actions = {'start_game': true};
          })();

          beforeEach(function () {
            createHideAndShow(winGame, 'win_game', 0);
            hideAndShow.hideNewData();
          });

          it('should hide game', function () {
            expect(scores.previousGame.hidden).toBeTruthy();
          });
        });

        describe('hides new set and game', function () {
          describe('when start match', function () {
            var startMatch;
            (function () {
              startMatch = angular.copy(sampleScores);
              startMatch.actions = {'win_game': true};
            })();

            beforeEach(function () {
              createHideAndShow(startMatch, 'start_play', 0);
              hideAndShow.hideNewData();
            });

            it('should hide game', function () {
              expect(scores.currentGame.hidden).toBeTruthy();
            });

            it('should hide set', function () {
              expect(scores.currentSet.hidden).toBeTruthy();
            });
          });

          describe('when start set', function () {
            var startSet;
            (function () {
              startSet = angular.copy(sampleScores);
              startSet.actions = {'win_game': true};
            })();

            beforeEach(function () {
              createHideAndShow(startSet, 'start_set', 0);
              hideAndShow.hideNewData();
            });

            it('should hide game', function () {
              expect(scores.currentGame.hidden).toBeTruthy();
            });

            it('should hide set', function () {
              expect(scores.currentSet.hidden).toBeTruthy();
            });
          });
        });
      });
    });
  })
})();

