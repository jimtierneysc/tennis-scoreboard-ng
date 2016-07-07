(function () {
  'use strict';

  describe('service Authentication', function () {
    var USERNAME = 'username';
    var TOKEN = 'token';

    var service;

    beforeEach(module('frontend'));
    beforeEach(function() {
      inject(function (_authenticationService_) {
        service = _authenticationService_;
        service.clearCredentials();
      })
    });

    it('should be registered', function () {
      expect(service).not.toEqual(null);
    });

    it('is logged out', function () {
      expect(service.loggedIn).toBeFalsy();
    });

    describe('storage', function () {
      var $localStorage;
      beforeEach(function() {
        inject(function (_$localStorage_) {
          $localStorage = _$localStorage_;
        })
      });

      it('has data name', function() {
        expect(service.localDataName).toEqual(jasmine.any(String))
      });

      describe('sets data', function () {
        beforeEach(function () {
          service.setCredentials(USERNAME, TOKEN);
        });

        it('is not null', function () {
          expect($localStorage[service.localDataName]).not.toBeNull();
        });

        it('has data', function () {
          expect($localStorage[service.localDataName]).toEqual(jasmine.any(Object))
        });

      });

      describe('clears data', function () {
        beforeEach(function () {
          service.clearCredentials();
        });

        it('has no data', function () {
          expect($localStorage[service.localDataName]).toBeUndefined();
        });

      });

      describe('load data', function () {
        var data;
        beforeEach(function () {
          service.setCredentials(USERNAME, TOKEN);
          data = $localStorage[service.localDataName];
          service.clearCredentials();
          $localStorage[service.localDataName] = data;
          service.loadCredentials();
        });

        it('is not null', function () {
          expect(data).not.toBeNull();
        });

        it('has data', function () {
          expect(data).toEqual(jasmine.any(Object));
        });

        it('is logged in', function() {
          expect(service.loggedIn).toEqual(true);
        })

      });
    });

    describe('clear local storage', function () {
      beforeEach(function () {
        service.clearCredentials();
      });

      it('has no data', function () {
        expect(localStorage[service.localDataName]).not.toBeNull();
      });

    });

    describe('logged in', function () {
      var USERNAME = 'username';
      var TOKEN = 'token';
      var $http;
      beforeEach(function() {
        inject(function (_$http_) {
          $http = _$http_;
          service.setCredentials(USERNAME, TOKEN);
        })
      });

      it('is logged in', function () {
        expect(service.loggedIn).toBeTruthy();
      });

      it('has username', function () {
        expect(service.userName).toBe(USERNAME);
      });

      it('sets http header', function () {
        expect($http.defaults.headers.common[service.headerName]).toBe(TOKEN);
      });
    });

    describe('log out', function () {
      var $http;
      beforeEach(function() {
        inject(function (_$http_) {
          $http = _$http_;
          service.setCredentials(USERNAME, TOKEN);
          expect(service.loggedIn).toBeTruthy();
          service.clearCredentials();
        })
      });

      it('is logged out', function () {
        expect(service.loggedIn).toBeFalsy();
      });

      it('has username', function () {
        expect(service.userName).toBe('');
      });

      it('sets http header', function () {
        expect($http.defaults.headers.common[service.headerName]).toBeUndefined();
      });
    });

    describe('subscribe changed', function () {
      var scope;
      var changed;

      beforeEach(function() {

        inject(function ($rootScope) {
          scope = $rootScope.$new();
          changed = jasmine.createSpy('dummy')
          service.subscribeChanged(scope, changed);
        })
      });

      it('should not be called', function () {
        expect(changed).not.toHaveBeenCalled();
      });

      it('should set credentials', function () {
        service.setCredentials('username', 'token');
        expect(changed).toHaveBeenCalled();
      });

      it('should clear credentials', function () {
        service.clearCredentials();
        expect(changed).toHaveBeenCalled();
      });

      it('should load credentials', function () {
        service.loadCredentials();
        expect(changed).toHaveBeenCalled();
      });

    });
  });
})();

