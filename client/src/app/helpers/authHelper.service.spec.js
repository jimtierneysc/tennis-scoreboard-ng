(function () {
  'use strict';
  
  describe('authHelper service', function () {
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
      it('should support auth', function () {
        expect(vm).toSupportAuth();
      });
    });

    describe('authentication', function () {
      var service;
      var USERNAME = 'someuser';

      beforeEach(function () {

        inject(function (userCredentials) {
          service = userCredentials;
        });
        service.setCredentials(USERNAME, '')
      });

      it('should get .userName when .setCredentials()', function () {
        expect(vm.userName).toEqual(USERNAME);
      });

      it('should be .loggedIn when .setCredentials', function () {
        expect(vm.loggedIn).toEqual(true);
      });

      it('should not be .loggedIn when .clearCredentials', function () {
        service.clearCredentials();
        expect(vm.loggedIn).toEqual(false);
      });

      it('should not be .loggedIn after .logOut()', function () {
        vm.logOut();
        expect(service.loggedIn).toEqual(false);
      });
    })
  });
  
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

})();

