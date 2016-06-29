(function () {
  'use strict';

  describe('controller header', function () {
    var vm;

    beforeEach(module('frontend'));
    beforeEach(function () {

      inject(function (_$controller_, $rootScope) {
        var $scope = $rootScope.$new();
        vm = _$controller_('HeaderController', {
          $scope: $scope
        });
      });
    });

    it('should be registered', function () {
      expect(vm.loading).not.toBe(null);
    });

    it('has auth support', function() {
      expect(vm.loggedIn).toEqual(jasmine.any(Boolean));
    });

    it('has members', function() {
      expect(vm.isCollapsed).toEqual(jasmine.any(Boolean));
      expect(vm.createLoginForm).toEqual(jasmine.any(Boolean));
      expect(vm.showingLogin).toEqual(jasmine.any(Function));
      expect(vm.showLogin).toEqual(jasmine.any(Function));
    });

    it('creates login form at startup', function() {
      expect(vm.createLoginForm).toEqual(true);
    })

    it('collapse navbar at startup', function() {
      expect(vm.isCollapsed).toEqual(true);
    })

    it('creates login form when showing', function() {
      vm.showLogin(false);
      vm.showingLogin(true);
      expect(vm.createLoginForm).toEqual(true);
    })

    it('destroys login form when close', function() {
      vm.showLogin(false);
      expect(vm.createLoginForm).toEqual(false);
    })


  })
})();
