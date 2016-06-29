(function () {
  'use strict';

  describe('helper toastr', function () {

    beforeEach(module('frontend'));

    describe('service', function () {
      var service;

      beforeEach(function () {

        inject(function (_toastrHelper_) {
          service = _toastrHelper_;
        })
      });

      it('should be registered', function () {
        expect(service).not.toEqual(null);
      });

      it('should activate', function () {
        expect(service.activate).toEqual(jasmine.any(Function));
      });

      describe('activate', function () {
        var vm = {};
        var scope;
        var $rootScope;

        beforeEach(function () {

          inject(function(_$rootScope_) {
            $rootScope = _$rootScope_;
            scope = $rootScope.$new();
          });
          service.activate(vm, scope);
        });

        it('should have show error function', function () {
          expect(vm.showToastrError).toEqual(jasmine.any(Function));
        });

        it('should have lastToast', function () {
          expect(vm.lastToast).toBeNull();
        });

        it('should show toast', function () {
          vm.showToastrError('test');
          expect(vm.lastToast).not.toBeNull();
        });

        it('should close toast when scope destroyed', function () {
          vm.showToastrError('test');
          scope.$destroy();
          $rootScope.$digest();
          expect(vm.lastToast).toBeNull();
        });

      })
    })

  })
})();

