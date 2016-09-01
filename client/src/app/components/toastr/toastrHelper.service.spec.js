(function () {
  'use strict';

  describe('toastrHelper service', function () {

    beforeEach(module('app.components'));

    var service;

    beforeEach(function () {
      inject(function (_toastrHelper_) {
        service = _toastrHelper_;
      })
    });

    it('should be a function', function () {
      expect(service).toEqual(jasmine.any(Function));
    });

    describe('activate', function () {
      var vm = {};
      var scope;
      var $rootScope;

      beforeEach(function () {
        inject(function (_$rootScope_) {
          $rootScope = _$rootScope_;
          scope = $rootScope.$new();
        });
        service(vm, scope);
      });

      describe('members', function () {
        it('should have .showToast()', function () {
          expect(vm.showToast).toEqual(jasmine.any(Function));
        });

        it('should have .showHttpErrorToast()', function () {
          expect(vm.showHttpErrorToast).toEqual(jasmine.any(Function));
        });

        it('should have .lastToast', function () {
          expect(vm.lastToast).toBeNull();
        });
      });

      describe('.showToast', function () {
        it('should show toast', function () {
          vm.showToast('test');
          expect(vm.lastToast).not.toBeNull();
        });

        it('should close toast when scope destroyed', function () {
          vm.showToast('test');
          scope.$destroy();
          $rootScope.$digest();
          expect(vm.lastToast).toBeNull();
        });
      });

      describe('.showHttpErrorToast', function () {
        describe('error 401', function() {
          var result;
          beforeEach(function(){
            result = vm.showHttpErrorToast(401);
          });

          it('should show toast', function() {
            expect(vm.lastToast).not.toBeNull();
          });

          it('should return true', function() {
            expect(result).toBeTruthy();
          });
        });

        describe('error 403', function() {
          var result;
          beforeEach(function(){
            result = vm.showHttpErrorToast(403);
          });

          it('should not show toast', function() {
            expect(vm.lastToast).toBeNull();
          });

          it('should return false', function() {
            expect(result).toBeFalsy();
          });
        });

      })
    })
  });
  /*global MatcherHelper*/

  beforeEach(function () {
    var matchers = {
      toHaveToast: function () {
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

          helper.checkFunction('showToast');
          helper.checkObject('lastToast', false);
          return helper.getResult();
        }
      }
    };

    jasmine.addMatchers(matchers);
  });

})();

