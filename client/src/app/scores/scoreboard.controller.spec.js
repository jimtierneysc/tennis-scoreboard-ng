(function () {
  'use strict';

  describe('ScoreboardController', function () {
    var $controller;
    var $scope;
    var $rootScope;
    var mockResource;
    var $q;

    var firstPlayer = {
      id: 10,
      name: "one"
    };

    var secondPlayer = {
      id: 20,
      name: "one"
    };

    var firstTeam = {
      id: 100,
      name: "first",
      first_player: firstPlayer,
      second_player: secondPlayer
    };

    var secondTeam = {
      id: 200,
      name: "second",
      first_player: {
        id: 30,
        name: "three"
      },
      second_player: {
        id: 40,
        name: "four"
      }
    };

    var scoresResponse =
    {
      id: 1,
      state: "in_progress",
      sets: [{games: [{}]}],
      servers: [],
      actions: {},
      version: 100,
      near_winners: {set: [], match: []}
    };

    function doublesResponse() {
      var result = angular.copy(scoresResponse);
      result.doubles = true;
      result.first_team = angular.copy(firstTeam);
      result.second_team = angular.copy(secondTeam);
      return result;
    }

    function singlesResponse() {
      var result = angular.copy(scoresResponse);
      result.doubles = false;
      result.first_player = angular.copy(firstPlayer);
      result.second_player = angular.copy(secondPlayer);
      return result;
    }

    beforeEach(module('frontendScores'));

    function resolvedPromise() {
      return $q.resolve();
    }

    beforeEach(function () {
      module(function ($provide) {
        // Disable animation delays
        $provide.factory('animationTimers', function () {
          return {
            delayIn: resolvedPromise,
            delayOut: resolvedPromise,
            digest: resolvedPromise
          }
        });
      });
    });


    beforeEach(function () {

      inject(function (_$controller_, _$rootScope_, _$q_) {
        $rootScope = _$rootScope_;
        $controller = _$controller_;
        $scope = $rootScope.$new();
        $q = _$q_;
      });
      mockResource = new MockResource();
    });

    function scoreboardController(response) {
      var locals = {
        $scope: $scope,
        response: response,
        $stateParams: {id: scoresResponse.id},
        crudResource: mockResource
      };
      var result = $controller('ScoreboardController', locals);
      return result;
    }

    describe('members', function () {
      var vm;

      beforeEach(function () {
        vm = scoreboardController(singlesResponse());
      });

      it('should support auth', function () {
        expect(vm).toSupportAuth();
      });

      it('should support loading', function () {
        expect(vm).toSupportLoading();
      });

      it('should support toastr', function () {
        expect(vm).toSupportToastr();
      });

      it('should have .id', function () {
        expect(vm.id).toEqual(scoresResponse.id);
      });

      it('should have .view', function () {
        expect(vm.view).toEqual(jasmine.any(Object));
      });

      it('should have .scoreboard', function () {
        expect(vm.scoreboard).toEqual(jasmine.any(Object));
      });

    });

    describe('loading', function () {

      it('should load', function () {
        var vm = scoreboardController(singlesResponse());
        // custom matcher
        expect(vm).not.toFailLoading();
      });

      it('should fail', function () {
        var vm = scoreboardController({error: 'something'});
        expect(vm).toFailLoading();
      });
    });


    describe('scoreboard', function () {

      describe('prepare', function () {
        var sb;

        beforeEach(function () {
          var vm = scoreboardController(singlesResponse());
          sb = vm.scoreboard;
        });

        it('should have .opponents', function () {
          expect(sb.opponents).toEqual(jasmine.any(Array));
        });

        it('should not have .server', function () {
          expect(sb.server).toBe(null);
        });


        it('should not have .firstServers', function () {
          expect(sb.firstServers).toBeNull();
        });

      });

      describe('newGame', function () {
        var sb;
        beforeEach(function () {
          var response = doublesResponse();
          response.state = 'in_progress';
          response.actions = {start_game: true};
          var vm = scoreboardController(response);
          sb = vm.scoreboard;
        });

        it('should have newGame', function () {
          expect(sb.currentGame.newGame).toBeTruthy();
        });

        it('should have .firstServers', function () {
          expect(sb.firstServers.list.length).toBe(4);
        });
      });

      describe('newSet', function () {
        var sb;
        beforeEach(function () {
          var response = singlesResponse();
          response.state = 'in_progress';
          response.actions = {start_set: true};
          var vm = scoreboardController(response);
          sb = vm.scoreboard;
        });

        it('should have newSet', function () {
          expect(sb.currentSet.newSet).toBeTruthy();
        });
      });

      describe('sort order', function () {
        var sb;
        beforeEach(function () {
          var response = singlesResponse();
          response.sets = [
            {id: 0, games: [{id: 0}, {id: 1}]},
            {id: 1, games: []}
          ];
          var vm = scoreboardController(response);
          sb = vm.scoreboard;
        });

        it('should order sets descending', function () {
          expect(sb.sets[0].id).toEqual(1);
          expect(sb.sets[1].id).toEqual(0);
        });

        it('should order games descending', function () {
          expect(sb.sets[1].games[0].id).toEqual(1);
          expect(sb.sets[1].games[1].id).toEqual(0);
        });
      });
    });

    describe('update', function () {

      describe('when success', function () {
        var vm;
        beforeEach(function () {
          var response = singlesResponse();
          vm = scoreboardController(response);
          vm.view.updateScore('fake_action');
          $rootScope.$digest();
        });

        it('should have updated', function () {
          expect(vm.scoreboard.mockSaved).toBeTruthy();
        });

      });

      describe('when re-entered', function () {
        var vm;
        beforeEach(function () {
          var response = singlesResponse();
          vm = scoreboardController(response);
          vm.view.updateScore('first_action');
          vm.view.updateScore('second_action');
          $rootScope.$digest();
        });

        it('should have updated', function () {
          expect(vm.scoreboard.mockSaved).toBeTruthy();
        });

        it('should have ignored second update', function () {
          expect(mockResource.lastAction()).toEqual('first_action')
        });
      });

      describe('with param', function () {

        function startNextGameParams(id) {
          return {
            match_score_board: {
              player: id,
              action: 'start_game',
              version: 100
            }
          }
        }

        describe('singles', function () {

          var params = {};
          var playerId = 10;

          function addParams(action) {
            params[action] = {
              match_score_board: {
                player: playerId,
                action: action,
                version: 100
              }
            };
          }

          addParams('win_game');
          addParams('win_match');
          addParams('win_tiebreaker');

          var response;
          beforeEach(function () {
            response = singlesResponse();
          });

          angular.forEach(params, function (value, key) {
            it('should have valid params for ' + key + ' action', function () {
              mockResource.params = null;
              response.actions[key] = true;
              var vm = scoreboardController(response);
              vm.view.updateScore(key, 0);
              $rootScope.$digest();
              expect(mockResource.params).toEqual(params[key])
            });
          });

          it('should have valid params for start_game action', function () {
            mockResource.params = null;
            response.actions['start_game'] = true;
            var vm = scoreboardController(response);
            vm.view.updateScore('start_game', playerId);
            $rootScope.$digest();
            expect(mockResource.params).toEqual(startNextGameParams(playerId));
          });
        });

        describe('doubles', function () {

          var params = {};

          function addParams(action) {
            params[action] = {
              match_score_board: {
                team: 200,
                action: action,
                version: 100
              }
            }
          }

          addParams('win_game');
          addParams('win_match');
          addParams('win_tiebreaker');

          var response;
          beforeEach(function () {
            response = doublesResponse();
          });

          angular.forEach(params, function (value, key) {
            it('should have valid params for ' + key, function () {
              mockResource.params = null;
              response.actions[key] = true;
              var vm = scoreboardController(response);
              vm.view.updateScore(key, 1);
              $rootScope.$digest();
              expect(mockResource.params).toEqual(params[key])
            });
          });
        });
      });

      describe('data error', function () {
        var vm;
        beforeEach(function () {
          mockResource.respondWithDataError = true;
          var response = angular.copy(singlesResponse());
          vm = scoreboardController(response);
          vm.view.updateScore('fake_action');
          $rootScope.$digest();
        });

        it('should save with error', function () {
          expect(vm.scoreboard.mockSavedWithError).toBeTruthy();
        });

        it('should show toast', function () {
          expect(vm).toHaveToast();
        });

        it('should fail loading', function () {
          expect(vm).not.toFailLoading();
        });

      });

      describe('HTTP error', function () {
        var vm;
        beforeEach(function () {
          mockResource.respondWithHttpError = true;
          var response = singlesResponse();
          vm = scoreboardController(response);
          vm.view.updateScore('fake_action');
          $rootScope.$digest();
        });

        it('should not show toast', function () {
          expect(vm).not.toHaveToast();
        });

        it('should show loading error', function () {
          expect(vm).toFailLoading();
        });

      });

    }); // update

    describe('.view', function () {

      describe('members', function () {
        var view;
        beforeEach(function () {
          var vm = scoreboardController(singlesResponse());
          view = vm.view;
        });

        it('should have .updateScore()', function () {
          expect(view.updateScore).toEqual(jasmine.any(Function));
        });

        it('should have .animateScoreboardUpdate()', function () {
          expect(view.animateScoreboardUpdate).toEqual(jasmine.any(Function));
        });

        it('should have .toggleShowGames()', function () {
          expect(view.toggleShowGames).toEqual(jasmine.any(Function));
        });

        it('should have .toggleShowDescription()', function () {
          expect(view.toggleShowDescription).toEqual(jasmine.any(Function));
        });

        it('should have .toggleKeepingScore()', function () {
          expect(view.toggleKeepingScore).toEqual(jasmine.any(Function));
        });

        it('should have .canShowGame()', function () {
          expect(view.canShowGame).toEqual(jasmine.any(Function));
        });

        it('should have .loggedInChanged()', function () {
          expect(view.loggedInChanged).toEqual(jasmine.any(Function));
        });

        it('should have .loadSettings()', function () {
          expect(view.loadSettings).toEqual(jasmine.any(Function));
        });

        it('should have .storeSettings()', function () {
          expect(view.storeSettings).toEqual(jasmine.any(Function));
        });

        it('should have .showWinButtonHint', function () {
          expect(view.showWinButtonHint).toEqual(jasmine.any(Boolean));
        });

        describe('.settings', function () {
          it('should have .showGames', function () {
            expect(view.settings.showGames).toEqual(jasmine.any(Boolean));
          });

          it('should have .keepScore', function () {
            expect(view.settings.keepScore).toEqual(jasmine.any(Boolean));
          });

          it('should have .showDescription', function () {
            expect(view.settings.showDescription).toEqual(jasmine.any(Boolean));
          });
        });
      });

      var USERNAME = 'scoreboard username';
      var TOKEN = 'scoreboard token';

      describe('.keepingScore', function () {

        var userCredentials;
        var view;
        beforeEach(function () {
          inject(function (_userCredentials_) {
            userCredentials = _userCredentials_;
          });
          var vm = scoreboardController(singlesResponse());
          view = vm.view;
          userCredentials.setCredentials(USERNAME, TOKEN);
          view.settings.keepScore = true;
        });

        it('should be false when clear credentials', function () {
          userCredentials.clearCredentials();
          view.loggedInChanged();
          $rootScope.$digest();
          expect(view.keepingScore).toBeFalsy();
        });

        it('should be true when set credentials', function () {
          view.loggedInChanged();
          $rootScope.$digest();
          expect(view.keepingScore).toBeTruthy();
        });
      });

      describe('.showDescription', function () {
        var vm;
        beforeEach(function () {
          vm = scoreboardController(singlesResponse());
          vm.view.settings.showDescription = false;
        });

        it('should toggle to true', function () {
          vm.view.toggleShowDescription(true);
          expect(vm.view.settings.showDescription).toBeTruthy();
        });

        it('should toggle to false', function () {
          vm.view.toggleShowDescription(true);
          vm.view.toggleShowDescription(false);
          expect(vm.view.settings.showDescription).toBeFalsy();
        });
      });

      describe('.toggleShowGames()', function () {
        describe('when no games to show or hide', function () {
          var vm;
          beforeEach(function () {
            vm = scoreboardController(singlesResponse());
          });

          describe('and show', function () {
            beforeEach(function () {
              vm.view.settings.showGames = false;
              vm.view.toggleShowGames(true);
            });

            it('should toggle', function () {
              expect(vm.view.settings.showGames).toBeTruthy();
            });

            it('should show toast', function () {
              expect(vm).toHaveToast();
            });
          });

          describe('and hide', function () {
            beforeEach(function () {
              vm.view.settings.showGames = true;
              vm.view.toggleShowGames(false);
            });

            it('should toggle', function () {
              expect(vm.view.settings.showGames).toBeFalsy();
            });

            it('should show toast', function () {
              expect(vm).toHaveToast();
            });
          });
        });

        describe('when games to show or hide', function () {
          var vm;
          beforeEach(function () {
            var sb = singlesResponse();
            sb.sets[0].games[0].winner = 1;
            vm = scoreboardController(sb);
          });

          describe('and show', function () {
            beforeEach(function () {
              vm.view.settings.showGames = false;
              vm.view.toggleShowGames(true);
              $rootScope.$digest();
            });

            it('should toggle', function () {
              expect(vm.view.settings.showGames).toBeTruthy();
            });

            it('should not show toast', function () {
              expect(vm).not.toHaveToast();
            });
          });

          describe('and hide', function () {
            beforeEach(function () {
              vm.view.settings.showGames = true;
              vm.view.toggleShowGames(false);
              $rootScope.$digest();
            });

            it('should toggle', function () {
              expect(vm.view.settings.showGames).toBeFalsy();
            });

            it('should not show toast', function () {
              expect(vm).not.toHaveToast();
            });
          });

        });
      });

      describe('.toggleKeepingScore()', function () {

        describe('when not logged in', function () {
          var vm;
          beforeEach(function () {
            vm = scoreboardController(singlesResponse());
            vm.view.settings.keepScore = false;
            vm.loggedIn = false;
            vm.view.loggedInChanged();
            vm.view.toggleKeepingScore(true);
          });

          it('should not change', function () {
            expect(vm.view.settings.keepScore).toBeFalsy();
          });

          it('should show toast', function () {
            expect(vm).toHaveToast();
          });
        });

        describe('when logged in', function () {
          var vm;

          beforeEach(function () {
            vm = scoreboardController(singlesResponse());
            vm.loggedIn = true;
            vm.view.loggedInChanged();
            vm.view.settings.keepScore = false;
          });

          describe('when match over', function () {
            beforeEach(function () {
              vm.scoreboard.winner = 1;
              vm.view.toggleKeepingScore(true);
              $rootScope.$digest();
            });

            it('should toggle to true', function () {
              expect(vm.view.settings.keepScore).toBeTruthy();
            });

            it('should toggle to false', function () {
              vm.view.toggleKeepingScore(false);
              $rootScope.$digest();
              expect(vm.view.settings.keepScore).toBeFalsy();
            });

            it('should show toast', function () {
              expect(vm).toHaveToast();
            });
          });

          describe('when match in progress', function () {
            beforeEach(function () {
              vm.view.toggleKeepingScore(true);
              $rootScope.$digest();
            });

            it('should toggle to true', function () {
              expect(vm.view.settings.keepScore).toBeTruthy();
            });

            it('should toggle to false', function () {
              vm.view.toggleKeepingScore(false);
              $rootScope.$digest();
              expect(vm.view.settings.keepScore).toBeFalsy();
            });

            it('should not show toast', function () {
              expect(vm).not.toHaveToast();
            });
          });
        });
      });

      describe('.showWinButtonHint', function() {
        var view;
        beforeEach(function () {
          var vm = scoreboardController(singlesResponse());
          view = vm.view;
        });

        it('should be true initially', function() {
          expect(view.showWinButtonHint).toBeTruthy();
        });

        it('should be false after win action', function() {
          view.updateScore('win_game');
          $rootScope.$digest();
          expect(view.showWinButtonHint).toBeFalsy();
        })
      });

      describe('.canShowGame', function () {
        var newGame;
        var gameWithWinner;
        var view;
        beforeEach(function () {
          var vm = scoreboardController(singlesResponse());
          view = vm.view;
          view.settings.keepScore = true;
          view.settings.showGames = true;
          vm.loggedIn = true;
          view.loggedInChanged();
          $rootScope.$digest();

          newGame = {newGame: true};
          gameWithWinner = {winner: 1};
        });

        describe('when setting', function () {
          describe('.showGames off', function () {
            beforeEach(function () {
              view.settings.showGames = false;
            });

            it('should not show game with winner', function () {
              expect(view.canShowGame(gameWithWinner)).not.toBeTruthy();
            })
          });

          describe('.showGames on', function () {
            it('should show game with winner', function () {
              expect(view.canShowGame(gameWithWinner)).toBeTruthy();
            })
          });

          describe('.keepingScore off', function () {
            beforeEach(function () {
              view.settings.keepScore = false;
              view.loggedInChanged();
              $rootScope.$digest;
            });

            it('should not show new game', function () {
              expect(view.canShowGame(newGame)).toBeFalsy();
            })
          });

          describe('.keepingScore on', function () {
            it('should show new game', function () {
              expect(view.canShowGame(newGame)).toBeTruthy();
            })
          });
        })
      });

      describe('storage of settings', function () {
        var $localStorage;
        beforeEach(function () {
          inject(function (_$localStorage_) {
            $localStorage = _$localStorage_;
          })
        });

        it('should have data name', function () {
          var vm = scoreboardController(singlesResponse());
          expect(vm.view.localDataName()).toEqual(jasmine.any(String))
        });

        describe('save data', function () {
          var view;
          beforeEach(function () {
            var vm = scoreboardController(singlesResponse());
            view = vm.view;
            $localStorage[view.localDataName()] = undefined;
          });

          it('should have no data when initialized', function () {
            expect($localStorage[view.localDataName()]).toBeUndefined();
          });

          it('should have data stored', function () {
            view.storeSettings();
            expect($localStorage[view.localDataName()]).not.toBeUndefined();
          });
        });

        describe('load data', function () {
          var vm;
          beforeEach(function () {
            // Save
            vm = scoreboardController(singlesResponse());
            vm.view.settings.showGames = true;
            vm.view.settings.keepScore = true;
            vm.view.settings.showDescription = true;
            vm.view.storeSettings();
            // Load
            vm = scoreboardController(singlesResponse());
          });

          it('should have .showGames', function () {
            expect(vm.view.settings.showGames).toBe(true);
          });

          it('should have .showDescription', function () {
            expect(vm.view.settings.showDescription).toBe(true);
          });

          it('should have .keepScore', function () {
            expect(vm.view.settings.keepScore).toBe(true)
          });

          describe('.loadSettings', function () {
            beforeEach(function () {
              vm.view.settings.showGames = false;
              vm.view.settings.keepScore = false;
              vm.view.settings.showDescription = false;
              vm.view.loadSettings();
            });

            it('should have .showGames', function () {
              expect(vm.view.settings.showGames).toBe(true);
            });

            it('should have .showDescription', function () {
              expect(vm.view.settings.showDescription).toBe(true);
            });

            it('should have .keepScore', function () {
              expect(vm.view.settings.keepScore).toBe(true)
            });

          })
        });
      });
    });

    describe('confirm change', function () {
      var modalConfirm;
      var $q;
      var vm;

      beforeEach(function () {
        inject(function (_modalConfirm_, _$q_) {
          modalConfirm = _modalConfirm_;
          $q = _$q_;
        });
        vm = scoreboardController(singlesResponse());
      });

      var confirmActions = {
        discard_play: true,
        start_set: false
      };

      describe('open modal', function () {
        beforeEach(function () {
          spyOn(modalConfirm, 'confirm').and.callThrough();
        });

        angular.forEach(confirmActions, function (value, key) {
          describe(key, function () {
            beforeEach(function () {
              vm.view.updateScore(key);
            });
            var message = 'open modal for ' + key + ' action';
            if (value) {
              it('should ' + message, function () {
                expect(modalConfirm.confirm).toHaveBeenCalled();
              });
            }
            else {
              it('should not ' + message, function () {
                expect(modalConfirm.confirm).not.toHaveBeenCalled();
              });
            }
          })
        })
      });

      function returnPromise(resolve) {
        return function () {
          var deferred = $q.defer();
          if (resolve)
            deferred.resolve();
          else
            deferred.reject();
          return deferred.promise;
        }
      }

      describe('confirm action', function () {
        beforeEach(function () {
          spyOn(modalConfirm, 'confirm').and.callFake(returnPromise(true));
        });

        angular.forEach(confirmActions, function (value, key) {
          describe(key, function () {
            beforeEach(function () {
              mockResource.params = null;
              vm.view.updateScore(key);
              $rootScope.$digest();
            });
            var message = 'confirm ' + key + ' action';
            if (value) {
              it('should ' + message, function () {
                expect(mockResource.params).not.toBe(null);
              });
            } else {
              // No spec needed here.
            }
          })
        });
      });

      describe('cancel action', function () {
        beforeEach(function () {
          spyOn(modalConfirm, 'confirm').and.callFake(returnPromise(false));
        });

        angular.forEach(confirmActions, function (value, key) {
          describe(key, function () {
            beforeEach(function () {
              mockResource.params = null;
              vm.view.updateScore(key);
              $rootScope.$digest();
            });
            var message = 'cancel change for ' + key + ' action';
            if (value) {
              it('should ' + message, function () {
                expect(mockResource.params).toBe(null);
              });
            } else {
              it('should not ' + message, function () {
                expect(mockResource.params).not.toBe(null);
              });
            }
          })
        });
      });

    });

    function MockResource() {

      var _this = this;

      _this.respondWithHttpError = false;
      _this.respondWithDataError = false;
      _this.params = null;
      _this.lastAction = function () {
        return _this.params ? _this.params.match_score_board.action : null;
      };

      _this.getResource = function () {
        var methods;

        if (_this.respondWithHttpError)
          methods = {
            save: saveResourceWithHTTPError
          };
        else if (_this.respondWithDataError)
          methods = {
            save: saveRequestWithDataError
          };
        else
          methods = {
            save: saveResource
          };
        return methods;
      };

      _this.firstError = 'some error';

      _this.errors = {
        data: {
          someerror: _this.firstError,
          another: 'another error'
        }
      };

      function saveResource(id, item, fn1, fn2) { // eslint-disable-line
        var response = singlesResponse();
        _this.params = angular.copy(item);
        response.mockSaved = true;
        fn1(response);
      }

      function saveRequestWithDataError(id, item, fn1, fn2) { // eslint-disable-line
        var response = singlesResponse();
        response.mockSavedWithError = true;
        response.errors = _this.errors.data;
        fn1(response);
      }

      function saveResourceWithHTTPError(id, item, fn1, fn2) { // eslint-disable-line
        fn2(_this.errors);
      }
    }
  });
})();

