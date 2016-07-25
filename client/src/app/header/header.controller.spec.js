(function () {
  'use strict';

  fdescribe('HeaderController', function () {
    var vm;
    var $scope;
    var $timeout;
    var $rootScope;

    beforeEach(module('frontend-header'));

    beforeEach(function () {

      inject(function (_$controller_, _$rootScope_, _$timeout_) {
        $rootScope = _$rootScope_;
        $scope = $rootScope.$new();
        $timeout = _$timeout_;
        vm = _$controller_('HeaderController', {
          $scope: $scope
        });
      });
    });

    it('should support auth', function () {
      expect(vm).toSupportAuth();
    });

    describe('members', function () {
      it('should have .isCollapsed', function () {
        expect(vm.isCollapsed).toEqual(jasmine.any(Boolean));
      });

      it('should have .createLoginForm()', function () {
        expect(vm.createLoginForm).toEqual(jasmine.any(Boolean));
      });

      it('should have .showingLogin()', function () {
        expect(vm.showingLogin).toEqual(jasmine.any(Function));
      });

      it('should have .showLogin()', function () {
        expect(vm.showLogin).toEqual(jasmine.any(Function));
      });
    });

    it('should create login form initially', function () {
      expect(vm.createLoginForm).toEqual(true);
    });

    it('should collapse navbar initially', function () {
      expect(vm.isCollapsed).toEqual(true);
    });

    it('should create login form when showing', function () {
      vm.showLogin(false);
      vm.showingLogin(true);
      expect(vm.createLoginForm).toEqual(true);
    });

    it('should destroy login form when close', function () {
      vm.showLogin(false);
      expect(vm.createLoginForm).toEqual(false);
    });

    it('should set focus when login form is shown', function () {
      var setFocus = false;
      $scope.$on('fe-autoFocus', function () {
        setFocus = true;
      });
      vm.showLogin(true);
      $timeout.flush();
      expect(setFocus).toBeTruthy();
    });

    it('should collapse when reject close edit', function () {
      vm.isCollapsed = false;
      $rootScope.$emit('editing-in-progress:rejected', {});
      expect(vm.isCollapsed).toBeTruthy();
    });
  })
})();
