(function () {
  'use strict';

  fdescribe('ScoreboardController', function () {
    var $controller;
    var $scope;
    var $rootScope;
    var mockResource;

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
      sets: [{games: []}],
      servers: [],
      actions: {}
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

    beforeEach(module('frontend'));
    beforeEach(function () {

      inject(function (_$controller_, _$rootScope_) {
        $rootScope = _$rootScope_;
        $controller = _$controller_;
        $scope = $rootScope.$new();
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
      return $controller('ScoreboardController', locals);
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

        it('should have .btns', function () {
          expect(sb.btns).toEqual(jasmine.any(Object));
        });

        it('should not have .newGame', function () {
          expect(sb.newGame).toBeUndefined();
        });

        it('should not have .newSet', function () {
          expect(sb.newSet).toBeUndefined();
        });

        it('should not have .firstServers', function () {
          expect(sb.firstServers).toBeUndefined();
        });

        it('should have .update()', function () {
          expect(sb.update).toEqual(jasmine.any(Function));
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

        it('should equal newGame', function () {
          expect(sb.newGame).toEqual(jasmine.any(Object));
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

        it('should equal newSet', function () {
          expect(sb.newSet).toEqual(jasmine.any(Object));
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
      var waitIndicator;
      beforeEach(function () {
        inject(function (_waitIndicator_) {
          waitIndicator = _waitIndicator_;
        });
        spyOn(waitIndicator, 'beginWait').and.callThrough();
      });

      function expectWaitIndicator() {
        it('should call .beginWait()', function () {
          expect(waitIndicator.beginWait).toHaveBeenCalled();
        });

        it('should not be .waiting when finished', function () {
          expect(waitIndicator.waiting()).toBeFalsy();
        });
      }

      describe('success', function () {
        var vm;
        beforeEach(function () {
          var response = singlesResponse();
          vm = scoreboardController(response);
          var sb = vm.scoreboard;
          sb.update('fake_action', 0, true);
        });

        it('should have updated', function () {
          expect(vm.scoreboard.mockSaved).toBeTruthy();
        });

        expectWaitIndicator();
      });

      describe('with param', function () {

        function startNextGameParams(id) {
          return {
            match_score_board: {
              player: id,
              action: 'start_game'
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
                action: action
              }
            }
          }

          addParams('win_game');
          addParams('win_match');
          addParams('win_tiebreaker');

          var sb;
          beforeEach(function () {
            var response = singlesResponse();
            var vm = scoreboardController(response);
            sb = vm.scoreboard;
          });

          angular.forEach(params, function (value, key) {
            it('should have valid params for ' + key + ' action', function () {
              mockResource.params = null;
              sb.update(key, 0, true);
              expect(mockResource.params).toEqual(params[key])
            });
          });

          it('should have valid params for start_game action', function () {
            mockResource.params = null;
            sb.update('start_game', playerId, true);
            expect(mockResource.params).toEqual(startNextGameParams(10));
          });
        });

        describe('doubles', function () {

          var params = {};

          function addParams(action) {
            params[action] = {
              match_score_board: {
                team: 200,
                action: action
              }
            }
          }

          addParams('win_game');
          addParams('win_match');
          addParams('win_tiebreaker');

          var sb;
          beforeEach(function () {
            var response = doublesResponse();
            var vm = scoreboardController(response);
            sb = vm.scoreboard;
          });

          angular.forEach(params, function (value, key) {
            it('should have valid params for ' + key, function () {
              mockResource.params = null;
              sb.update(key, 1);
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
          var sb = vm.scoreboard;
          sb.update('fake_action', 0, true);
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

        expectWaitIndicator();
      });

      describe('HTTP error', function () {
        var vm;
        beforeEach(function () {
          mockResource.respondWithHTTPError = true;
          var response = singlesResponse();
          vm = scoreboardController(response);
          var sb = vm.scoreboard;
          sb.update('fake_action', 0, true);
        });

        it('should not show toast', function () {
          expect(vm).not.toHaveToast();
        });

        it('should show loading error', function () {
          expect(vm).toFailLoading();
        });
        
        expectWaitIndicator();
      });

    }); // update

    describe('.view', function () {

      describe('members', function () {
        var view;
        beforeEach(function () {
          var vm = scoreboardController(singlesResponse());
          view = vm.view;
        });

        it('should have .expand', function () {
          expect(view.expand).toEqual(jasmine.any(String));
        });

        it('should have .keepScore', function () {
          expect(view.keepScore).toEqual(jasmine.any(Boolean));
        });

        it('should have .keepingScore()', function () {
          expect(view.keepingScore).toEqual(jasmine.any(Function));
        });

        it('should have .changed()', function () {
          expect(view.changed).toEqual(jasmine.any(Function));
        });

        it('should have .showGames()', function () {
          expect(view.showGames).toEqual(jasmine.any(Function));
        });
      });

      describe('.keepingScore', function () {

        var userCredentials;
        var view;
        beforeEach(function () {
          inject(function (_userCredentials_) {
            userCredentials = _userCredentials_;
          });
          var vm = scoreboardController(singlesResponse());
          view = vm.view;
          userCredentials.setCredentials('user', 'token');
          view.keepScore = true;
        });

        it('should be false when clear credentials', function () {
          userCredentials.clearCredentials();
          expect(view.keepingScore()).toBeFalsy();
        });

        it('should be true when set credentials', function () {
          expect(view.keepingScore()).toBeTruthy();
        });
      });


      describe('.showGames()', function () {
        var vm;
        beforeEach(function () {
          vm = scoreboardController(singlesResponse());
          vm.scoreboard.sets = [{}, {}];

        });

        it('should show games when expanded', function () {
          vm.view.expand = 'expand_all';
          expect(vm.view.showGames(1)).toBeTruthy();

        });

        it('should not show games when collapsed', function () {
          vm.view.expand = 'collapse';
          expect(vm.view.showGames(1)).toBeFalsy();
        })
      });

      describe('storage of .expand and .keepingScore', function () {
        var $localStorage;
        beforeEach(function () {
          inject(function (_$localStorage_) {
            $localStorage = _$localStorage_;
          })
        });

        it('should have data name', function () {
          var vm = scoreboardController(singlesResponse());
          expect(vm.view.localDataName).toEqual(jasmine.any(String))
        });

        describe('save data', function () {
          var view;
          beforeEach(function () {
            var vm = scoreboardController(singlesResponse());
            view = vm.view;
            $localStorage[view.localDataName] = undefined;
          });

          it('should have no data when initialized', function () {
            expect($localStorage[view.localDataName]).toBeUndefined();
          });

          it('should have data after view changed', function () {
            view.changed();
            expect($localStorage[view.localDataName]).not.toBeUndefined();
          });
        });

        describe('load data', function () {
          beforeEach(function () {
            var vm = scoreboardController(singlesResponse());
            vm.view.expand = 'xyz';
            vm.view.keepScore = true;
            vm.view.changed();
          });

          it('should have .expand', function () {
            var vm = scoreboardController(singlesResponse());
            expect(vm.view.expand).toEqual('xyz');
          });

          it('should have .keepScore', function () {
            var vm = scoreboardController(singlesResponse());
            expect(vm.view.keepScore).toBe(true)
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
        restart_play: true,
        start_set: false
      };

      describe('open modal', function () {
        beforeEach(function () {
          spyOn(modalConfirm, 'confirm').and.callThrough();
        });

        angular.forEach(confirmActions, function (value, key) {
          describe(key, function () {
            beforeEach(function () {
              vm.scoreboard.update(key, 0, true);
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
              vm.scoreboard.update(key, 0, true);
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
              vm.scoreboard.update(key, 0, true);
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

      _this.respondWithHTTPError = false;
      _this.respondWithDataError = false;
      _this.params = null;

      _this.getResource = function () {
        var methods;

        if (_this.respondWithHTTPError)
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

