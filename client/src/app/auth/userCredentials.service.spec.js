(function () {
  'use strict';

  fdescribe('userCredentials service', function () {
    var USERNAME = 'userCredentials username';
    var USERNAME2 = 'userCredentials username2';
    var TOKEN = 'userCredentials token';

    var service;
    var $httpBackend;
    var path;

    beforeEach(module('frontend-auth'));
    afterEach(function () {
      localStorage.clear();
    });
    // beforeEach(module(function ($provide) {
    //   $provide.factory('validateCredentials', function () {
    //     return function() { return true };
    //   });
    // }));
    beforeEach(function () {
      inject(function (_userCredentials_, _$rootScope_, _$httpBackend_, _userResource_) {
        $httpBackend = _$httpBackend_;
        service = _userCredentials_;
        path = _userResource_.path;
        service.clearCredentials();
      })
    });

    it('should not be logged in initially', function () {
      expect(service.loggedIn).toBeFalsy();
    });

    describe('storage', function () {
      var $localStorage;
      beforeEach(function () {
        inject(function (_$localStorage_) {
          $localStorage = _$localStorage_;
        })
      });

      it('should have .localDataName', function () {
        expect(service.localDataName).toEqual(jasmine.any(String))
      });

      describe('sets data', function () {
        beforeEach(function () {
          service.setCredentials(USERNAME, TOKEN);
        });

        it('should not be null', function () {
          expect($localStorage[service.localDataName]).not.toBeNull();
        });

        it('should have data object', function () {
          expect($localStorage[service.localDataName]).toEqual(jasmine.any(Object))
        });

      });

      describe('clears data', function () {
        beforeEach(function () {
          service.clearCredentials();
        });

        it('should have no data', function () {
          expect($localStorage[service.localDataName]).toBeUndefined();
        });

      });

      describe('loads', function () {
        var data;
        beforeEach(function () {
          // Save to local storage
          service.setCredentials(USERNAME, TOKEN);
          data = $localStorage[service.localDataName];
          service.clearCredentials();
          $localStorage[service.localDataName] = data;
        });

        describe('valid credentials', function () {
          beforeEach(function () {
            $httpBackend.expect('GET', path).respond(200,
              {
                username: USERNAME2
              }
            );
            service.loadCredentials();
            $httpBackend.flush();
          });

          it('should have user name', function () {
            expect(service.userName).toEqual(USERNAME2);
          });

          it('should be logged in', function () {
            expect(service.loggedIn).toBeTruthy();
          })
        });

        describe('invalid credentials', function () {

          beforeEach(function () {

            $httpBackend.expect('GET', path).respond(401, {});
            service.loadCredentials();
            $httpBackend.flush();
          });

          it('should not be logged in', function () {
            expect(service.loggedIn).toBeFalsy();
          })
        });
      });
    });

    describe('.setCredentials()', function () {
      var USERNAME = USERNAME;
      var TOKEN = TOKEN;
      var $http;
      beforeEach(function () {
        inject(function (_$http_) {
          $http = _$http_;
          service.setCredentials(USERNAME, TOKEN);
        })
      });

      it('should be logged in', function () {
        expect(service.loggedIn).toBeTruthy();
      });

      it('should be correct username', function () {
        expect(service.userName).toBe(USERNAME);
      });

      it('should set http header', function () {
        expect($http.defaults.headers.common[service.headerName]).toBe(TOKEN);
      });
    });

    describe('.clearCredentials()', function () {
      var $http;
      beforeEach(function () {
        inject(function (_$http_) {
          $http = _$http_;
          service.setCredentials(USERNAME, TOKEN);
          expect(service.loggedIn).toBeTruthy();
          service.clearCredentials();
        })
      });

      it('should be logged out', function () {
        expect(service.loggedIn).toBeFalsy();
      });

      it('should have blank username', function () {
        expect(service.userName).toBe('');
      });

      it('should clear http header', function () {
        expect($http.defaults.headers.common[service.headerName]).toBeUndefined();
      });
    });

    describe('.subscribeChanged()', function () {
      var scope;
      var changed;

      beforeEach(function () {

        inject(function ($rootScope) {
          scope = $rootScope.$new();
          changed = jasmine.createSpy('dummy')
          service.subscribeChanged(scope, changed);
        })
      });

      it('should call event when set credentials', function () {
        service.setCredentials(USERNAME, TOKEN);
        expect(changed).toHaveBeenCalled();
      });

      it('should call event when clear credentials', function () {
        service.clearCredentials();
        expect(changed).toHaveBeenCalled();
      });

      it('should call event when load credentials', function () {
        service.loadCredentials();
        expect(changed).toHaveBeenCalled();
      });

    });
  });
})();

