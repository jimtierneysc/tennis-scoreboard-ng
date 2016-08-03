(function () {
  'use strict';

  describe('authHelper service', function () {
    var service;
    var scope;
    var $rootScope;
    var vm = {};

    beforeEach(module('frontendAuth'));

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
      var authInterceptor;
      var USERNAME = 'authHelper username';

      beforeEach(function () {

        inject(function (_userCredentials_, _authInterceptor_) {
          userCredentials = _userCredentials_;
          authInterceptor = _authInterceptor_;
        });
        userCredentials.setCredentials(USERNAME, '')
      });

      it('should get .userName when .setCredentials()', function () {
        expect(vm.userName).toEqual(USERNAME);
      });

      it('should be .loggedIn when .setCredentials', function () {
        expect(vm.loggedIn).toEqual(true);
      });

      it('should not be .loggedIn when .clearCredentials', function () {
        userCredentials.clearCredentials();
        expect(vm.loggedIn).toEqual(false);
      });

      it('should not be .loggedIn after .logOut()', function () {
        vm.logOut();
        $rootScope.$digest();
        expect(userCredentials.loggedIn).toEqual(false);
      });

      it('should clear credentials when unauthorized', function() {
        authInterceptor.responseError({status: 401});
        expect(vm.loggedIn).toEqual(false);
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
          helper.checkString('userName');

          return helper.getResult();
        }
      }
    };

    jasmine.addMatchers(matchers);
  });

})();

