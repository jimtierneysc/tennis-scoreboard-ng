(function () {
  'use strict';

  describe('routerConfig', function () {

    var $rootScope;
    var $state;
    var stateExpectations = {};

    (function () {
      var stateDescriptions = {
        home: {url: '/', noResponse: true, view: 'home'},
        players: {},
        teams: {},
        matches: {},
        scores: {},
        'scores.board': {
          url: '/board/:id',
          controller: 'ScoreboardController',
          templateUrl: 'app/scores/scoreboard.html',
          params: {id: '1'}
        }
      };

      function setExpectation(key, value) {
        stateExpectations[key] = {
          url: value.url || '/' + key,
          templateUrl: value.templateUrl || 'app/' + key + '/' + key + '.html',
          controllerAs: 'vm',
          response: !value.noResponse,
          view: value.view || 'content',
          controller:
          value.controller || key.charAt(0).toUpperCase() + key.slice(1) + 'Controller'
        }
      }

      angular.forEach(stateDescriptions, function (value, key) {
        setExpectation(key, value)
      });
    })();

    beforeEach(module('app.router'));

    beforeEach(function () {
      inject(function (_$rootScope_, _$state_) {
        $rootScope = _$rootScope_;
        $state = _$state_;
      });
    });

    describe('templates', function () {
      angular.forEach(stateExpectations, function (value, key) {
        describe('state ' + key, function () {
          var state;
          beforeEach(function () {
            state = $state.get(key);
          });

          it('should match url', function () {
            expect(state.url).toEqual(value.url);
          });

          it('should match templateUrl', function () {
            if (state.views)
              expect(state.views[value.view].templateUrl).toEqual(value.templateUrl);
            else
              expect(state.templateUrl).toEqual(value.templateUrl);
          });

          it('should match controller', function () {
            if (state.views)
              expect(state.views[value.view].controller).toEqual(value.controller);
            else
              expect(state.controller).toEqual(value.controller);
          });

          it('should match resolve', function () {
            if (value.response)
              if (state.views)
                expect(state.views.content.resolve.response).toEqual(jasmine.any(Function));
              else
                expect(state.resolve.response).toEqual(jasmine.any(Function));
          });
        });
      });
    });

    describe('resolve', function () {
      var crudResource;
      var mockResource;

      beforeEach(function () {
        inject(function (_crudResource_) {
          crudResource = _crudResource_;
        });
        mockResource = new MockResource();
        spyOn(crudResource, 'getResource').and.callFake(mockResource.getResource)
      });

      function goState(state, params) {
        $state.go(state, params);
        $rootScope.$digest();
      }

      describe('response ok', function () {
        angular.forEach(stateExpectations, function (value, state) {
          describe('state "' + state + '"', function () {
            beforeEach(function () {
              mockResource.lastId = null;
              mockResource.lastResponse = null;
              goState(state, value.params);
            });

            it('should change $state', function () {
              expect($state.current.name).toEqual(state);
            });

            it('should have id', function () {
              if (value.params)
                expect(mockResource.lastParams).toEqual(value.params);
            });

            it('should pass success response', function () {
              if (value.response)
                expect($state.$current.locals['content@'].response).toEqual(mockResource.lastResponse)
            });
          });
        });
      });

      describe('response error', function () {
        beforeEach(function () {
          mockResource.respondWithError = true;
        });

        angular.forEach(stateExpectations, function (value, state) {
          describe('state "' + state + '"', function () {
            beforeEach(function () {
              goState(state, value);
            });

            it('should change $state', function () {
              expect($state.current.name).toEqual(state);
            });

            it('should pass error response', function () {
              if (value.response)
                expect($state.$current.locals['content@'].response).toEqual(mockResource.errors)
            });
          });
        });
      });
    });
  });

  function MockResource() {

    var _this = this;

    _this.respondWithError = false;
    _this.lastParams = null;
    _this.lastResponse = null;

    _this.getResource = function () {
      var methods;

      if (!_this.respondWithError)
        methods = {
          query: queryResource,
          get: getResource
        };
      else
        methods = {
          query: queryResourceError,
          get: getResourceError
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

    function queryResource(fn1, fn2) { // eslint-disable-line
      _this.lastResponse = [{id:1234}];
      fn1(_this.lastResponse);
    }

    function queryResourceError(fn1, fn2) { // eslint-disable-line
      fn2(_this.errors);
    }

    function getResource(params, fn1, fn2) { // eslint-disable-line
      _this.lastResponse = {id:111};
      _this.lastParams = angular.copy(params);
      fn1(_this.lastResponse)
    }

    function getResourceError(id, fn1, fn2) { // eslint-disable-line
      fn2(_this.errors)
    }
  }
})();
