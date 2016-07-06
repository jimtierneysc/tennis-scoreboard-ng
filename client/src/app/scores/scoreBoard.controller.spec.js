(function () {
  'use strict';

  describe('controller scoreboard', function () {
    var $controller;
    var $scope;
    var $q;
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
      actions: {},
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

      inject(function (_$controller_, _$q_, _$rootScope_) {
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

        it('has #view', function () {
          expect(sb.view).toEqual(jasmine.any(Object));
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

        it('has #keepingScore', function () {
          expect(sb.keepingScore).toEqual(jasmine.any(Function));
        });

        it('has #updateScore', function () {
          expect(sb.updateScore).toEqual(jasmine.any(Function));
        });

        it('has #changeViewExpand', function () {
          expect(sb.changeViewExpand).toEqual(jasmine.any(Function));
        });

        it('has #changeViewKeepScore', function () {
          expect(sb.changeViewKeepScore).toEqual(jasmine.any(Function));
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
        sb.updateScore('fake', 0, true);
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
            sb.updateScore(key, 0, true);
            expect(mockResource.params).toEqual(params[key])
          });
        });

        it('valid params for start_next_game', function () {
          mockResource.params = null;
          sb.updateScore('start_next_game', 10, true);
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
            sb.updateScore(key, 1);
            expect(mockResource.params).toEqual(params[key])
          });

        });
      });


    });

    describe('save data error', function () {
      var vm;
      var gameCount;
      beforeEach(function () {
        mockResource.respondWithDataError = true;
        var response = angular.copy(singlesResponse());
        vm = scoreboardController(response);
        var sb = vm.scoreboard;
        sb.updateScore('fake', 0, true);
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
      var gameCount;
      beforeEach(function () {
        mockResource.respondWithHTTPError = true;
        var response = singlesResponse();
        vm = scoreboardController(response);
        var sb = vm.scoreboard;
        sb.updateScore('fake', 0, true);
      });

      it('should not show toastr', function () {
        expect(vm.lastToast).toBe(null);
      });

      it('should show loading error', function () {
        expect(vm.loadingFailed).toBeTruthy();
      });
    });

    describe('keeping score', function () {

      var authenticationService;
      var sb;
      beforeEach(function () {
        inject(function (_authenticationService_) {
          authenticationService = _authenticationService_;
        });
        var vm = scoreboardController(singlesResponse());
        sb = vm.scoreboard;
        authenticationService.setCredentials('user', 'token');
        sb.view.keepScore = true;
      });

      it('should be false when not logged in', function () {
        authenticationService.clearCredentials();
        expect(sb.keepingScore()).toBeFalsy();
      })

      it('should be true when not logged in', function () {
        expect(sb.keepingScore()).toBeTruthy();
      })

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

