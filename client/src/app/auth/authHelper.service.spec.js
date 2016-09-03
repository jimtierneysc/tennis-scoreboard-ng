(function () {
  'use strict';

  describe('authHelper service', function () {
    var service;
    var scope;
    var $rootScope;
    var vm = {};

    beforeEach(module('app.auth'));

    beforeEach(function () {
      inject(function (_authHelper_, _$rootScope_) {
        service = _authHelper_;
        $rootScope = _$rootScope_;
        scope = _$rootScope_.$new();
      });
      // Add auth functionality to vm
      service(vm, scope);
    });

    describe('members', function () {
      it('should support auth', function () {
        expect(vm).toSupportAuth();
      });
    });

    describe('authentication', function () {
      var userCredentials;
      var authHttpInterceptor;
      var USERNAME = 'authHelper username';

      beforeEach(function () {

        inject(function (_userCredentials_, _authHttpInterceptor_) {
          userCredentials = _userCredentials_;
          authHttpInterceptor = _authHttpInterceptor_;
        });
        userCredentials.setCredentials(USERNAME, '')
      });

      it('should get .username when .setCredentials()', function () {
        expect(vm.username).toEqual(USERNAME);
      });

      it('should be .loggedIn when .setCredentials', function () {
        expect(vm.loggedIn).toBeTruthy();
      });

      it('should not be .loggedIn when .clearCredentials', function () {
        userCredentials.clearCredentials();
        expect(vm.loggedIn).toBeFalsy();
      });

      it('should not be .loggedIn after .logOut()', function () {
        vm.logOut();
        $rootScope.$digest();
        expect(userCredentials.loggedIn).toBeFalsy();
      });

      it('should clear credentials when unauthorized', function() {
        authHttpInterceptor.responseError({status: 401});
        expect(vm.loggedIn).toBeFalsy();
      });
    })
  });

  // Define matchers to test controllers for auth support
  beforeEach(function () {
    var matchers = {
      toSupportAuth: function () {
        return {
          compare: compare
        };
        function compare(vm) {
          /*global MatcherHelper*/
          var helper = new MatcherHelper(vm);

          helper.checkFunction('logOut');
          helper.checkBoolean('loggedIn');
          helper.checkString('username');

          return helper.getResult();
        }
      }
    };

    jasmine.addMatchers(matchers);
  });

})();

