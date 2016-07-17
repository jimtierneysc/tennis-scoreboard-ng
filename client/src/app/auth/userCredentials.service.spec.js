(function () {
  'use strict';

  describe('userCredentials service', function () {
    var USERNAME = 'username';
    var TOKEN = 'token';

    var service;

    beforeEach(module('frontend'));
    beforeEach(function() {
      inject(function (_userCredentials_) {
        service = _userCredentials_;
        service.clearCredentials();
      })
    });

    it('should not be logged in initially', function () {
      expect(service.loggedIn).toBeFalsy();
    });

    describe('storage', function () {
      var $localStorage;
      beforeEach(function() {
        inject(function (_$localStorage_) {
          $localStorage = _$localStorage_;
        })
      });

      it('should have .localDataName', function() {
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

      describe('loads data', function () {
        var data;
        beforeEach(function () {
          service.setCredentials(USERNAME, TOKEN);
          data = $localStorage[service.localDataName];
          service.clearCredentials();
          $localStorage[service.localDataName] = data;
          service.loadCredentials();
        });

        it('should not be null', function () {
          expect(data).not.toBeNull();
        });

        it('should have data object', function () {
          expect(data).toEqual(jasmine.any(Object));
        });

        it('should be logged in', function() {
          expect(service.loggedIn).toEqual(true);
        })

      });
    });

    describe('.setCredentials()', function () {
      var USERNAME = 'username';
      var TOKEN = 'token';
      var $http;
      beforeEach(function() {
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
      beforeEach(function() {
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

      beforeEach(function() {

        inject(function ($rootScope) {
          scope = $rootScope.$new();
          changed = jasmine.createSpy('dummy')
          service.subscribeChanged(scope, changed);
        })
      });

      it('should call event when set credentials', function () {
        service.setCredentials('username', 'token');
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

