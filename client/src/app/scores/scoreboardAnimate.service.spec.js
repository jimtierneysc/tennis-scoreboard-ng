(function () {
  'use strict';

  describe('scoreboardAnimate service', function () {
    var service;
    var $timeout;
    var scoreboardPrep;
    var scores;
    var animate;
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

    beforeEach(module('frontendScores'));

    beforeEach(function () {
      inject(function (_scoreboardAnimate_, _scoreboardPrep_, _$timeout_) {
        service = _scoreboardAnimate_;
        scoreboardPrep = _scoreboardPrep_;
        $timeout = _$timeout_;
      })
    });

    describe('members', function () {
      it('should have .animateAction()', function () {
        expect(service.animateAction).toEqual(jasmine.any(Function));
      });

      it('should have .animateKeepScore()', function () {
        expect(service.animateKeepScore).toEqual(jasmine.any(Function));
      });
    });

    function checkAnimateMembers() {
      it('should have .hideChanging()', function () {
        expect(animate.hideChanging).toEqual(jasmine.any(Function));
      });

      it('should have .hideChanged()', function () {
        expect(animate.hideChanged).toEqual(jasmine.any(Function));
      });

      it('should have .stop()', function () {
        expect(animate.stop).toEqual(jasmine.any(Function));
      });

      it('should have .showChanged()', function () {
        expect(animate.showChanged).toEqual(jasmine.any(Function));
      });
    }

    function checkStop() {

      beforeEach(function () {
        scores.matchFlags.animatingFoo = true;
        scores.matchFlags.hiddenFoo = true;
      });

      it('should clear animating', function () {
        animate.stop();
        expect(scores.matchFlags.animatingFoo).toBeFalsy();
      });

      it('should clear hiding', function () {
        animate.stop();
        expect(scores.matchFlags.hiddenFoo).toBeFalsy();
      });

    }

    describe('animateKeepScore()', function () {

      var animateKeepScore;

      function createAnimateKeepScore(sample, keepScore) {
        sample = sample || sampleScores;
        scores = scoreboardPrep(angular.copy(sample));
        animateKeepScore = service.animateKeepScore(scores, keepScore);
      }

      describe('members', function () {
        beforeEach(function () {
          createAnimateKeepScore();
          animate = animateKeepScore;
        });

        checkAnimateMembers();

      });

      describe('.stop', function () {
        beforeEach(function () {
          createAnimateKeepScore(null, false);
          animate = animateKeepScore;
        });

        checkStop();
      });

      describe('hides progress', function () {
        beforeEach(function () {
          createAnimateKeepScore(null, false);
        });

        describe('.hideChanging', function () {
          beforeEach(function () {
            animateKeepScore.hideChanging();
            $timeout.flush();
          });

          it('should hide', function () {
            expect(scores.matchFlags.hiddenProgress).toBeTruthy();
          });

          it('should animate', function () {
            expect(scores.matchFlags.animatingProgress).toBeTruthy();
          });
        });

        describe('.hideChanged', function () {
          beforeEach(function () {
            animateKeepScore.hideChanged();
          });

          it('should hide', function () {
            expect(scores.matchFlags.hiddenProgress).toBeTruthy();
          });

          describe('.showChanged', function () {
            beforeEach(function () {
              animateKeepScore.showChanged();
            });

            it('should show', function () {
              expect(scores.matchFlags.hiddenProgress).toBeFalsy();
            });

          });
        });
      });

      describe('hides when starting game', function () {
        var newGame;
        (function () {
          newGame = angular.copy(sampleScores);
          newGame.actions = {start_game: true};
        })();

        describe('when turn on keep score', function () {

          beforeEach(function () {
            createAnimateKeepScore(newGame, true);
          });

          describe('.hideChanging', function () {
            beforeEach(function () {
              animateKeepScore.hideChanging();
              $timeout.flush();
            });

            it('should animate current game', function () {
              expect(scores.currentGame.animating).toBeTruthy();
            });

            it('should hide currrent game', function () {
              expect(scores.currentGame.hidden).toBeTruthy();
            });
          });

        });

        describe('when turn off keep score', function () {

          beforeEach(function () {
            createAnimateKeepScore(newGame, false);
          });

          describe('.hideChanging', function () {
            beforeEach(function () {
              animateKeepScore.hideChanging();
              $timeout.flush();
            });

            it('should animate current game', function () {
              expect(scores.currentGame.animating).toBeTruthy();
            });
          });

          describe('.hideChanged', function () {
            beforeEach(function () {
              animateKeepScore.hideChanged();
            });

            it('should hide game', function () {
              expect(scores.currentGame.hidden).toBeTruthy();
            });

            describe('.showChanged', function () {
              beforeEach(function () {
                animateKeepScore.showChanged();
              });

              it('should no hide game', function () {
                expect(scores.currentGame.hidden).toBeFalsy();
              });

            });
          });
        });


      });

      describe('hides when game in progress', function () {
        var gameInProgress;
        (function () {
          gameInProgress = angular.copy(sampleScores, false);
          gameInProgress.actions = {win_game: true};
        })();

        describe('when turn on keep score', function () {

          beforeEach(function () {
            createAnimateKeepScore(gameInProgress, true);
          });

          describe('.hideChanging', function () {
            beforeEach(function () {
              animateKeepScore.hideChanging();
              $timeout.flush();
            });

            it('should animate win button', function () {
              expect(scores.currentGame.animatingWinButton).toBeTruthy();
            });

            it('should hide win button', function () {
              expect(scores.currentGame.hiddenWinButton).toBeTruthy();
            });

          });

          describe('.hideChanged', function () {
            beforeEach(function () {
              animateKeepScore.hideChanged();
            });

            it('should hide row status', function () {
              expect(scores.currentGame.hiddenRowStatus).toBeTruthy();
            });

            describe('.showChanged', function () {
              beforeEach(function () {
                animateKeepScore.showChanged();
              });

              it('should not hide row status', function () {
                expect(scores.currentGame.hiddenRowStatus).toBeFalsy();
              });

            });
          });
        });


        describe('when turn off keep', function () {

          beforeEach(function () {
            createAnimateKeepScore(gameInProgress, false);
          });

          describe('.hideChanging', function () {
            beforeEach(function () {
              animateKeepScore.hideChanging();
              $timeout.flush();
            });

            it('should hide row status', function () {
              expect(scores.currentGame.hiddenRowStatus).toBeTruthy();
            });

            it('should animate row status', function () {
              expect(scores.currentGame.animatingRowStatus).toBeTruthy();
            });
          });

          describe('.hideChanged', function () {
            beforeEach(function () {
              animateKeepScore.hideChanged();
            });

            it('should hide win button', function () {
              expect(scores.currentGame.hiddenWinButton).toBeTruthy();
            });

            describe('.showChanged', function () {
              beforeEach(function () {
                animateKeepScore.showChanged();
              });

              it('should not hide win button', function () {
                expect(scores.currentGame.hiddenWinButton).toBeFalsy();
              });

            });
          });
        });
      });
    });


    describe('animateAction()', function () {

      var animateAction;

      function createAnimateAction(sample, action, param) {
        sample = sample || sampleScores;
        action = action || 'some_action';
        scores = scoreboardPrep(angular.copy(sample));
        animateAction = service.animateAction(scores, action, param);
      }

      describe('members', function () {
        beforeEach(function () {
          createAnimateAction();
          animate = animateAction;
        });

        checkAnimateMembers();

      });

      describe('.hideChanging()', function () {

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

        var servingGame;
        (function() {
          servingGame = angular.copy(sampleScores);
          servingGame.actions = {'start_game': true};
          servingGame.firstServers = [1, 2];
        })();

        describe('hides server form when staring game', function() {
          beforeEach(function() {
            createAnimateAction(servingGame, 'start_game', 0);
            animateAction.hideChanging();
            $timeout.flush();
          });

          it('should hide servers form', function() {
            expect(scores.currentGame.hiddenServersForm).toBeTruthy();
          });
        });

        describe('hides match score when winning set', function () {

          it('should not be hidden initially', function () {
            createAnimateAction(winGame);
            expect(scores.matchFlags.hiddenResult).toBeFalsy();
          });

          describe('left side', function () {
            beforeEach(function () {
              createAnimateAction(nearWinMatch, 'win_game', 0);
              animateAction.hideChanging();
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
              createAnimateAction(nearWinMatch, 'win_game', 1);
              animateAction.hideChanging();
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
            createAnimateAction(winGame);
            expect(scores.currentSet.hiddenResult).toBeFalsy();
          });

          describe('left', function () {
            beforeEach(function () {
              createAnimateAction(nearWinSet, 'win_game', 0);
              animateAction.hideChanging();
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
              createAnimateAction(nearWinSet, 'win_game', 1);
              animateAction.hideChanging();
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
            createAnimateAction(winGame);
            expect(scores.currentGame.hiddenTitle).toBeFalsy();
          });

          describe('hide', function () {
            beforeEach(function () {
              createAnimateAction(winGame, 'win_game', 0);
              animateAction.hideChanging();
              $timeout.flush();
            });

            it('should hide title', function () {
              expect(scores.currentGame.hiddenTitle).toBeTruthy();
            });
          });
        });

        describe('hides progress for any action', function () {
          beforeEach(function () {
            createAnimateAction();
          });

          it('should not be hidden initially', function () {
            expect(scores.matchFlags.hiddenProgress).toBeFalsy();
          });

          it('should be hidden', function () {
            animateAction.hideChanging();
            $timeout.flush();
            expect(scores.matchFlags.hiddenProgress).toBeTruthy();
          })
        });
      });

      describe('.hideChanged()', function () {
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
                createAnimateAction(winMatch, 'win_game', 0);
                animateAction.hideChanged();
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
                createAnimateAction(winMatch, 'win_game', 1);
                animateAction.hideChanged();
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
              createAnimateAction(winSet, 'win_game', 0);
              animateAction.hideChanged();
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
                createAnimateAction(startGame, 'win_game', 0);
                animateAction.hideChanged();
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
                createAnimateAction(startGame, 'win_game', 1);
                animateAction.hideChanged();
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
              createAnimateAction(startSecondSet, 'win_game', 1);
              animateAction.hideChanged();
            });

            it('should hide result of previous set', function () {
              expect(scores.previousSet.hiddenResult).toBeTruthy();
            });
          });
        });

        describe('hides game title', function () {

          it('should not be hidden initially', function () {
            createAnimateAction(startGame);
            expect(scores.currentGame.hiddenTitle).toBeFalsy();
          });

          describe('hides when start game', function () {
            beforeEach(function () {
              createAnimateAction(startGame, 'win_game', 0);
              animateAction.hideChanged();
            });

            it('should hide title', function () {
              expect(scores.currentGame.hiddenTitle).toBeTruthy();
            });
          });
        });

        describe('hides progress for any action', function () {
          beforeEach(function () {
            createAnimateAction();
          });

          it('should be hidden', function () {
            animateAction.hideChanged();
            expect(scores.matchFlags.hiddenProgress).toBeTruthy();
          })
        });

        describe('hides game before show', function () {
          var winGame;
          (function () {
            winGame = angular.copy(sampleScores);
            winGame.actions = {'start_game': true};
          })();

          beforeEach(function () {
            createAnimateAction(winGame, 'win_game', 0);
            animateAction.hideChanged();
          });

          it('should hide game', function () {
            expect(scores.previousGame.hidden).toBeTruthy();
          });
        });

        describe('hides win button before show', function () {
          var winGame;
          (function () {
            winGame = angular.copy(sampleScores);
            winGame.actions = {'win_game': true};
          })();

          beforeEach(function () {
            createAnimateAction(winGame, 'start_game', 0);
            animateAction.hideChanged();
          });

          it('should hide win button', function () {
            expect(scores.currentGame.hiddenWinButton).toBeTruthy();
          });
        });

        describe('hides new set and game before show', function () {
          describe('when start match', function () {
            var startMatch;
            (function () {
              startMatch = angular.copy(sampleScores);
              startMatch.actions = {'win_game': true};
            })();

            beforeEach(function () {
              createAnimateAction(startMatch, 'start_play', 0);
              animateAction.hideChanged();
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
              createAnimateAction(startSet, 'start_set', 0);
              animateAction.hideChanged();
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
    })
  })
})();

