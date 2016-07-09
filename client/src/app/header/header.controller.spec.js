(function () {
  'use strict';

  describe('controller header', function () {
    var vm;
    var $scope;
    var $timeout;

    beforeEach(module('frontend'));
    beforeEach(function () {

      inject(function (_$controller_, _$rootScope_, _$timeout_) {
        var $rootScope = _$rootScope_;
        $scope = $rootScope.$new();
        $timeout = _$timeout_;
        vm = _$controller_('HeaderController', {
          $scope: $scope
        });
      });
    });

    it('supports auth', function () {
      expect(vm).toSupportAuth();
    });

    describe('members', function () {
      it('has .isCollapsed', function () {
        expect(vm.isCollapsed).toEqual(jasmine.any(Boolean));
      });

      it('has .createLoginForm()', function () {
        expect(vm.createLoginForm).toEqual(jasmine.any(Boolean));
      });

      it('has .showingLogin()', function () {
        expect(vm.showingLogin).toEqual(jasmine.any(Function));
      });

      it('has .showLogin()', function () {
        expect(vm.showLogin).toEqual(jasmine.any(Function));
      });
    });

    it('creates login form at startup', function () {
      expect(vm.createLoginForm).toEqual(true);
    });

    it('collapse navbar at startup', function () {
      expect(vm.isCollapsed).toEqual(true);
    });

    it('creates login form when showing', function () {
      vm.showLogin(false);
      vm.showingLogin(true);
      expect(vm.createLoginForm).toEqual(true);
    });

    it('destroys login form when close', function () {
      vm.showLogin(false);
      expect(vm.createLoginForm).toEqual(false);
    });

    it('sets focus when login form show', function () {
      var setFocus = false;
      $scope.$on('fe-autoFocus', function () {
        setFocus = true;
      });
      vm.showLogin(true);
      $timeout.flush();
      expect(setFocus).toBeTruthy();
    });
  })
})();
