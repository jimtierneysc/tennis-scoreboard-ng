(function () {
  'use strict';

  beforeEach(function () {
    var matchers = {
     toHaveToast: function() {
        return {
          compare: function (vm) {
            var helper = new MatcherHelper(vm);
            if (!vm.lastToast)
              helper.fail('expect to have .lastToast');
            return helper.getResult();
          }
        }
      },
      toSupportToastr: function () {
        return {
          compare: compare
        };
        function compare(vm) {
          var helper = new MatcherHelper(vm);

          helper.checkFunction('showToastrError');
          helper.checkObject('lastToast', false);
          return helper.getResult();
        }
      }
    };

    jasmine.addMatchers(matchers);
  });


  describe('helper toastr', function () {

    beforeEach(module('frontend'));

    describe('service', function () {
      var service;

      beforeEach(function () {
        inject(function (_toastrHelper_) {
          service = _toastrHelper_;
        })
      });

      it('is function', function () {
        expect(service).toEqual(jasmine.any(Function));
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
          service(vm, scope);
        });

        describe('members', function() {
          it('has .showToastrError()', function () {
            expect(vm.showToastrError).toEqual(jasmine.any(Function));
          });

          it('has .lastToast', function () {
            expect(vm.lastToast).toBeNull();
          });
        });

        describe('toast', function() {
          it('shows toast', function () {
            vm.showToastrError('test');
            expect(vm.lastToast).not.toBeNull();
          });

          it('closes toast when scope destroyed', function () {
            vm.showToastrError('test');
            scope.$destroy();
            $rootScope.$digest();
            expect(vm.lastToast).toBeNull();
          });
        });
      })
    })
  })
})();

