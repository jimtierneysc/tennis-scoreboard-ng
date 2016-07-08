(function () {
  'use strict';

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
      it('has .supportsAuth', function () {
        expect(vm.supportsAuth).toBeTruthy();
      });

      it('has .loggedIn', function () {
        expect(vm.loggedIn).toEqual(jasmine.any(Boolean));
      });

      it('has .userName', function () {
        expect(vm.userName).toEqual(jasmine.any(String));
      });

      it('has .logOut()', function () {
        expect(vm.logOut).toEqual(jasmine.any(Function));
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

