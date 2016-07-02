(function () {
  'use strict';

  describe('helper auth', function () {

    beforeEach(module('frontend'));

    describe('service', function () {
      var service;

      beforeEach(function () {

        inject(function (_authHelper_) {
          service = _authHelper_;
        })
      });

      it('should be registered', function () {
        expect(service).not.toEqual(null);
      });

      it('should activate', function () {
        expect(service.activate).toEqual(jasmine.any(Function));
      });

      describe('activate', function () {
        var scope;
        var vm = {};

        beforeEach(function () {

          inject(function($rootScope) {
            scope = $rootScope.$new();
          });
          service.activate(vm, scope);
        });

        it ('should support', function() {
          expect(vm.supportsAuth).toBe(true);
        });

        it ('should have loggedin member', function() {
          expect(vm.loggedIn).toEqual(jasmine.any(Boolean));
        });

        it ('should have username member', function() {
          expect(vm.userName).toEqual(jasmine.any(String));
        });

        it ('should have logOut member', function() {
          expect(vm.logOut).toEqual(jasmine.any(Function));
        });

        describe('use authentication service', function () {
          var service;
          var USERNAME = 'someuser';

          beforeEach(function () {

            inject(function(authenticationService) {
              service = authenticationService;
            });
            service.setCredentials(USERNAME, '')
          });

          it('should have username', function () {
            expect(vm.userName).toEqual(USERNAME);
          });

          it('should be logged in', function () {
            expect(vm.loggedIn).toEqual(true);
          });

          it('should log out', function () {
            service.clearCredentials();
            expect(vm.loggedIn).toEqual(false);
          });

          it('should clearCredentials', function () {
            vm.logOut();
            expect(service.loggedIn).toEqual(false);
          });

        });


      });

    })

  })
})();

