(function () {
  'use strict';
  
  beforeEach(function () {
    var matchers = {
      toSupportAuth: function () {
        return {
          compare: compare
        };
        function compare(vm) {
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

  describe('helper auth', function () {
    var service;
    var scope;
    var vm = {};

    beforeEach(module('frontend'));

    beforeEach(function () {
      inject(function (_authHelper_, _$rootScope_) {
        service = _authHelper_;
        scope = _$rootScope_.$new();
      });
      service(vm, scope);
    });

    describe('members', function () {
      it('supports auth', function () {
        expect(vm).toSupportAuth();
      });
    });

    describe('login and logout', function () {
      var service;
      var USERNAME = 'someuser';

      beforeEach(function () {

        inject(function (authenticationService) {
          service = authenticationService;
        });
        service.setCredentials(USERNAME, '')
      });

      it('has .userName when .setCredentials()', function () {
        expect(vm.userName).toEqual(USERNAME);
      });

      it('is .loggedIn when .setCredentials', function () {
        expect(vm.loggedIn).toEqual(true);
      });

      it('is not .loggedIn when .clearCredentials', function () {
        service.clearCredentials();
        expect(vm.loggedIn).toEqual(false);
      });

      it('is not .loggedIn after .logOut()', function () {
        vm.logOut();
        expect(service.loggedIn).toEqual(false);
      });
    })
  })
})();

