(function () {
  'use strict';

  describe('controller scoreboard', function () {
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
      // title: "doubles title",
      id: 1,
      // scoring: "two_six_game_ten_points",
      // doubles: true,
      state: "in_progress",
      // winner: 1,
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

      describe('supports', function () {

        it('should support auth', function () {
          expect(vm.supportsAuth).toBeTruthy();
        });

        it('should support loading', function () {
          expect(vm.supportsLoading).toBeTruthy();
        });

        it('should support toastr', function () {
          expect(vm.supportsToastr).toBeTruthy();
        });

      });

      it('has id', function () {
        expect(vm.id).toEqual(scoresResponse.id);
      });
      it('has #view', function () {
        expect(vm.view).toEqual(jasmine.any(Object));
      });

    });

    describe('loading', function () {

      it('should load', function () {
        var vm = scoreboardController(singlesResponse());
        expect(vm.loadingFailed).toBeFalsy();
      });

      it('should fail', function () {
        var vm = scoreboardController({error: 'something'});
        expect(vm.loadingFailed).toBeTruthy();
      });
    });


    describe('#scoreboard', function () {

      describe('prepare values', function () {
        var sb;

        beforeEach(function () {
          var vm = scoreboardController(singlesResponse());
          sb = vm.scoreboard;
        });

        it('has #opponents', function () {
          expect(sb.opponents).toEqual(jasmine.any(Array));
        });

        it('does not have #server', function () {
          expect(sb.server).toBe(null);
        });

        it('has #btns', function () {
          expect(sb.btns).toEqual(jasmine.any(Object));
        });

        it('does not have #newGame', function () {
          expect(sb.newGame).toBeUndefined();
        });

        it('does not have #newSet', function () {
          expect(sb.newSet).toBeUndefined();
        });

        it('does not have #firstServers', function () {
          expect(sb.firstServers).toBeUndefined();
        });

      });

      describe('prepare methods', function () {
        var sb;

        beforeEach(function () {
          var vm = scoreboardController(singlesResponse());
          sb = vm.scoreboard;
        });

        it('has #update', function () {
          expect(sb.update).toEqual(jasmine.any(Function));
        });

      });

      describe('newGame', function () {
        var sb;
        beforeEach(function () {
          var response = doublesResponse();
          response.state = 'in_progress';
          response.actions = {start_next_game: true};
          var vm = scoreboardController(response);
          sb = vm.scoreboard;
        });

        it('has #newGame', function () {
          expect(sb.newGame).toEqual(jasmine.any(Object));
        });

        it('has #firstServers', function () {
          expect(sb.firstServers.list.length).toBe(4);
        });

      });

      describe('#newSet', function () {
        var sb;
        beforeEach(function () {
          var response = singlesResponse();
          response.state = 'in_progress';
          response.actions = {start_next_set: true};
          var vm = scoreboardController(response);
          sb = vm.scoreboard;
        });

        it('has #newSet', function () {
          expect(sb.newSet).toEqual(jasmine.any(Object));
        });
      });

      describe('descending order', function () {
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

        it('ordered sets', function () {
          expect(sb.sets[0].id).toEqual(1);
          expect(sb.sets[1].id).toEqual(0);
        });

        it('ordered games', function () {
          expect(sb.sets[1].games[0].id).toEqual(1);
          expect(sb.sets[1].games[1].id).toEqual(0);
        });
      });
    });


    describe('save success', function () {
      var vm;
      beforeEach(function () {
        var response = singlesResponse();
        vm = scoreboardController(response);
        var sb = vm.scoreboard;
        sb.update('fake', 0, true);
      });

      it('should save', function () {
        expect(vm.scoreboard.mockSaved).toBeTruthy();
      });
    });

    describe('save params', function () {

      function startNextGameParams(id) {
        return {
          match_score_board: {
            player: id,
            action: 'start_next_game'
          }
        }
      }

      describe('singles', function () {

        var params = {};

        function addParams(action) {
          params[action] = {
            match_score_board: {
              player: 10,
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
          it('valid params for ' + key, function () {
            mockResource.params = null;
            sb.update(key, 0, true);
            expect(mockResource.params).toEqual(params[key])
          });
        });

        it('valid params for start_next_game', function () {
          mockResource.params = null;
          sb.update('start_next_game', 10, true);
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
          it('valid params for ' + key, function () {
            mockResource.params = null;
            sb.update(key, 1);
            expect(mockResource.params).toEqual(params[key])
          });

        });
      });


    });

    describe('save data error', function () {
      var vm;
      beforeEach(function () {
        mockResource.respondWithDataError = true;
        var response = angular.copy(singlesResponse());
        vm = scoreboardController(response);
        var sb = vm.scoreboard;
        sb.update('fake', 0, true);
      });

      it('should save with error', function () {
        expect(vm.scoreboard.mockSavedWithError).toBeTruthy();
      });

      it('should show toastr', function () {
        expect(vm.lastToast).not.toBe(null);
      });

      it('not show loading error', function () {
        expect(vm.loadingFailed).toBeFalsy();
      });

    });

    describe('save HTTP error', function () {
      var vm;
      beforeEach(function () {
        mockResource.respondWithHTTPError = true;
        var response = singlesResponse();
        vm = scoreboardController(response);
        var sb = vm.scoreboard;
        sb.update('fake', 0, true);
      });

      it('should not show toastr', function () {
        expect(vm.lastToast).toBe(null);
      });

      it('should show loading error', function () {
        expect(vm.loadingFailed).toBeTruthy();
      });
    });

    describe('#view', function() {

      describe('members', function() {
        var view;
        beforeEach(function () {
          var vm = scoreboardController(singlesResponse());
          view = vm.view;
         });

        it('has #expand', function() {
          expect(view.expand).toEqual(jasmine.any(String));
        });

        it('has #keepScore', function() {
          expect(view.keepScore).toEqual(jasmine.any(Boolean));
        });

        it('has #keepingScore', function() {
          expect(view.keepingScore).toEqual(jasmine.any(Function));
        });

        it('has #changeKeepScore', function() {
          expect(view.changeKeepScore).toEqual(jasmine.any(Function));
        });

        it('has #changeExpand', function() {
          expect(view.changeExpand).toEqual(jasmine.any(Function));
        });

        it('has #showGames', function() {
          expect(view.showGames).toEqual(jasmine.any(Function));
        });

      });

      describe('#keepingScore', function () {

        var authenticationService;
        var view;
        beforeEach(function () {
          inject(function (_authenticationService_) {
            authenticationService = _authenticationService_;
          });
          var vm = scoreboardController(singlesResponse());
          view = vm.view;
          authenticationService.setCredentials('user', 'token');
          view.keepScore = true;
        });

        it('should be false when not logged in', function () {
          authenticationService.clearCredentials();
          expect(view.keepingScore()).toBeFalsy();
        });

        it('should be true when not logged in', function () {
          expect(view.keepingScore()).toBeTruthy();
        });

      });


      describe('#showGames', function() {

      });

      // describe('storage of #expand and #keepingScore', function () {
      //   var $localStorage;
      //   beforeEach(function() {
      //     inject(function (_$localStorage_) {
      //       $localStorage = _$localStorage_;
      //     })
      //   });
      //
      //   it('has data name', function() {
      //     var vm = scoreboardController(singlesResponse());
      //     expect(vm.view.localDataName).toEqual(jasmine.any(String))
      //   });
      //
      //   describe('sets data', function () {
      //     var view;
      //     beforeEach(function () {
      //       var vm = scoreboardController(singlesResponse());
      //       view = vm.view;
      //     });
      //
      //     it('is not null', function () {
      //       expect($localStorage[view.localDataName]).not.toBeNull();
      //     });
      //
      //     it('has data', function () {
      //       expect($localStorage[view.localDataName]).toEqual(jasmine.any(Object))
      //     });
      //   });
      //
      //   describe('load data', function () {
      //     var data;
      //     beforeEach(function () {
      //       // data = $localStorage[view.localDataName];
      //       // service.clearCredentials();
      //       // $localStorage[service.localDataName] = data;
      //       // service.loadCredentials();
      //     });
      //
      //     it('is not null', function () {
      //       expect(data).not.toBeNull();
      //     });
      //
      //     it('has data', function () {
      //       expect(data).toEqual(jasmine.any(Object));
      //     });
      //
      //   });
      // });
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

      function saveResource(id, item, fn1, fn2) {
        var response = singlesResponse();
        _this.params = angular.copy(item);
        response.mockSaved = true;
        fn1(response);
      }

      function saveRequestWithDataError(id, item, fn1, fn2) {
        var response = singlesResponse();
        response.mockSavedWithError = true;
        response.errors = _this.errors.data;
        fn1(response);
      }

      function saveResourceWithHTTPError(id, item, fn1, fn2) {
        fn2(_this.errors);
      }
    }

  });
})();

