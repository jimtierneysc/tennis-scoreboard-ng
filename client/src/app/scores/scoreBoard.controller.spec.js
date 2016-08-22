(function () {
  'use strict';

  describe('ScoreboardController', function () {
    var $controller;
    var $scope;
    var $rootScope;
    var mockResource;
    var $timeout;

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
      near_winners:{set: [], match: []}
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

    beforeEach(function () {

      inject(function (_$controller_, _$rootScope_, _$timeout_) {
        $rootScope = _$rootScope_;
        $controller = _$controller_;
        $scope = $rootScope.$new();
        $timeout = _$timeout_;
      });
      mockResource = new MockResource();
    });

    function scoreboardController(response, disableAnimation) {
      if (angular.isUndefined(disableAnimation))
        disableAnimation = true;
      var locals = {
        $scope: $scope,
        response: response,
        $stateParams: {id: scoresResponse.id},
        crudResource: mockResource
      };
      var result = $controller('ScoreboardController', locals);
      if (disableAnimation)
        result.view.disableAnimations();
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

      // it('should have .updateScore', function () {
      //   expect(vm.updateScore).toEqual(jasmine.any(Function));
      // });
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
          vm.view.updateScore('fake_action', 0, true);
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
          vm.view.updateScore('first_action', 0, true);
          vm.view.updateScore('second_action', 0, true);
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
            }
          }

          addParams('win_game');
          addParams('win_match');
          addParams('win_tiebreaker');

          var vm;
          beforeEach(function () {
            var response = singlesResponse();
            vm = scoreboardController(response);
          });

          angular.forEach(params, function (value, key) {
            it('should have valid params for ' + key + ' action', function () {
              mockResource.params = null;
              vm.view.updateScore(key, 0, true);
              $rootScope.$digest();
              expect(mockResource.params).toEqual(params[key])
            });
          });

          it('should have valid params for start_game action', function () {
            mockResource.params = null;
            vm.view.updateScore('start_game', playerId, true);
            $rootScope.$digest();
            expect(mockResource.params).toEqual(startNextGameParams(10));
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

          var vm;
          beforeEach(function () {
            var response = doublesResponse();
            vm = scoreboardController(response);
          });

          angular.forEach(params, function (value, key) {
            it('should have valid params for ' + key, function () {
              mockResource.params = null;
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
          vm.view.updateScore('fake_action', 0, true);
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
          vm.view.updateScore('fake_action', 0, true);
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

        it('should have .animateScoreboardChanges()', function () {
          expect(view.animateScoreboardChanges).toEqual(jasmine.any(Function));
        });

        it('should have .disableAnimations()', function () {
          expect(view.disableAnimations).toEqual(jasmine.any(Function));
        });

        it('should have .toggleShowGames', function () {
          expect(view.toggleShowGames).toEqual(jasmine.any(Function));
        });

        it('should have .toggleShowDescription', function () {
          expect(view.toggleShowDescription).toEqual(jasmine.any(Function));
        });

        it('should have .toggleKeepScore', function () {
          expect(view.toggleKeepScore).toEqual(jasmine.any(Function));
        });

        it('should have .storeSettings', function () {
          expect(view.storeSettings).toEqual(jasmine.any(Function));
        });

        describe('.settings', function() {
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
          expect(view.keepingScore).toBeFalsy();
        });

        it('should be true when set credentials', function () {
          view.loggedInChanged();
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
          vm.view.toggleShowDescription();
          expect(vm.view.settings.showDescription).toBeTruthy();
        });

        it('should toggle to false', function () {
          vm.view.toggleShowDescription();
          vm.view.toggleShowDescription();
          expect(vm.view.settings.showDescription).toBeFalsy();
        });
      });

      describe('.toggleShowGames()', function () {
        var vm;
        beforeEach(function () {
          vm = scoreboardController(singlesResponse());
          vm.view.settings.showGames = false;
        });

        it('should toggle to true', function () {
          vm.view.toggleShowGames(true);
          expect(vm.view.settings.showGames).toBeTruthy();
        });

        it('should toggle to false', function () {
          vm.view.toggleShowGames(true);
          vm.view.toggleShowGames(false);
          expect(vm.view.settings.showGames).toBeFalsy();
        });
      });

      describe('.toggleKeepScore()', function () {
        var vm;
        beforeEach(function () {
          vm = scoreboardController(singlesResponse());
          vm.view.settings.keepScore = false;
          vm.loggedIn = true;
          vm.view.loggedInChanged();

        });

        it('should toggle to true', function () {
          vm.view.toggleKeepScore(true);
          expect(vm.view.settings.keepScore).toBeTruthy();
        });

        it('should toggle to false', function () {
          vm.view.toggleKeepScore(true);
          vm.view.toggleKeepScore(false);
          expect(vm.view.settings.keepScore).toBeFalsy();
        });
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
          beforeEach(function () {
            // Save
            var vm = scoreboardController(singlesResponse());
            vm.view.settings.showGames = true;
            vm.view.settings.keepScore = true;
            vm.view.settings.showDescription = true;
            vm.view.storeSettings();
          });

          it('should have .showGames', function () {
            // Load
            var vm = scoreboardController(singlesResponse());
            expect(vm.view.settings.showGames).toBe(true);
          });

          it('should have .showDescription', function () {
            // Load
            var vm = scoreboardController(singlesResponse());
            expect(vm.view.settings.showDescription).toBe(true);
          });

          it('should have .keepScore', function () {
            // Load
            var vm = scoreboardController(singlesResponse());
            expect(vm.view.settings.keepScore).toBe(true)
          });
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
              vm.view.updateScore(key, 0, true);
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
              vm.view.updateScore(key, 0, true);
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
              vm.view.updateScore(key, 0, true);
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

      describe('animations', function () {
        var vm;
        beforeEach(function () {
          // Enable animation
          vm = scoreboardController(singlesResponse(), false);
        });

        describe('.toggleShowGames()', function () {

          it('should toggle to true', function () {
            vm.view.settings.showGames = false;
            vm.view.toggleShowGames(true);
            $timeout.flush();
            $timeout.flush();
            expect(vm.view.settings.showGames).toBeTruthy();
          });

          it('should toggle to false', function () {
            vm.view.settings.showGames = true;
            vm.view.toggleShowGames();
            $timeout.flush();
            $timeout.flush();
            expect(vm.view.settings.showGames).toBeFalsy();
          });

        });

        describe('.updateScore', function () {

          describe('http error', function() {
            beforeEach(function () {
              mockResource.respondWithHttpError = true;
              vm.view.updateScore('fake_action', 0, true);
              $rootScope.$digest();
              $timeout.flush();
              $timeout.flush();
            });

            it('should show loading error', function () {
              expect(vm).toFailLoading();
            });
          });

          describe('success', function() {
            beforeEach(function () {
              vm.view.updateScore('fake_action', 0, true);
              $rootScope.$digest();
              $timeout.flush();
              $timeout.flush();
            });

            it('should have updated', function () {
              expect(vm.scoreboard.mockSaved).toBeTruthy();
            });
          });

        });
      });
    });

    function MockResource() {

      var _this = this;

      _this.respondWithHttpError = false;
      _this.respondWithDataError = false;
      _this.params = null;
      _this.lastAction = function() {
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

