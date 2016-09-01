(function () {
  'use strict';

  describe('animateChange service', function () {

    var service;
    var animationTimers;
    var $rootScope;
    var $q;

    beforeEach(module('app.animation'));

    beforeEach(function () {
      module(function ($provide) {
        // Disable animation delays
        $provide.factory('animationTimers', function () {
          return {
            delayIn: resolvedPromise,
            delayOut: resolvedPromise,
            digest: resolvedPromise
          }
        });
      });

      function resolvedPromise() {
        return $q.resolve();
      }
    });

    beforeEach(function () {

      inject(function (_$q_, _animateChange_, _animationTimers_, _$rootScope_) {
        service = _animateChange_;
        animationTimers = _animationTimers_;
        $rootScope = _$rootScope_;
        $q = _$q_;
        spyOn(animationTimers, 'delayIn').and.callThrough();
        spyOn(animationTimers, 'delayOut').and.callThrough();
        spyOn(animationTimers, 'digest').and.callThrough();
      });
    });

    describe('members', function () {

      it('should have .promiseHideThenShow()', function () {
        expect(service.promiseHideThenShow).toEqual(jasmine.any(Function));
      });

      it('should have .promiseHideThenShow()', function () {
        expect(service.promiseHideThenShow).toEqual(jasmine.any(Function));
      });

      it('should have .toggleShow()', function () {
        expect(service.toggleShow).toEqual(jasmine.any(Function));
      });
    });

    describe('HideThenShow', function () {
      var hideAndShow;
      beforeEach(function () {
        hideAndShow = {
          hideChanging: jasmine.createSpy('a'),
          hideChanged: jasmine.createSpy('b'),
          showChanged: jasmine.createSpy('c'),
          reset: jasmine.createSpy('d')
        };
      });

      function checkCalled(resolve) {
        if (angular.isUndefined(resolve))
          resolve = true;

        it('should have called hideChanging()', function () {
          expect(hideAndShow.hideChanging).toHaveBeenCalled();
        });

        it('should have called reset()', function () {
          expect(hideAndShow.reset).toHaveBeenCalled();
        });

        var been = resolve ? ' been ' : ' not been ';
        function expectFn(fn) {
          var result = expect(fn);
          if (!resolve)
            result = result.not;
          return result;
        }

        it('should have' + been + 'called hideChanged()', function () {
          expectFn(hideAndShow.hideChanged).toHaveBeenCalled();
        });

        it('should have called showChanged()', function () {
          expectFn(hideAndShow.showChanged).toHaveBeenCalled();
        });
      }

      describe('.hideThenShow()', function () {
        var change;
        beforeEach(function () {
          change = jasmine.createSpy('change');
          service.hideThenShow(change, hideAndShow);
          $rootScope.$digest();
        });

        describe('check called', function() {
          checkCalled();
        });

        it('should have called change()', function () {
          expect(change).toHaveBeenCalled();
        });
      });

      describe('.promiseHideThenShow()', function () {
        var change;
        var final;
        var reject;
        var response = {};
        beforeEach(function () {
          change = jasmine.createSpy('2');
          final = jasmine.createSpy('3');
          reject = jasmine.createSpy('3');
        });

        describe('resolve', function() {
          beforeEach(function () {
            service.promiseHideThenShow($q.resolve(response), change, hideAndShow,
              reject, final);
            $rootScope.$digest();
          });

          describe('check called', function () {
            checkCalled();
          });

          it('should have called change()', function () {
            expect(change).toHaveBeenCalledWith(response);
          });

          it('should have called final()', function () {
            expect(final).toHaveBeenCalled();
          });
        });

        describe('reject', function() {
          var response = {};
          beforeEach(function () {
            service.promiseHideThenShow($q.reject(response), change, hideAndShow,
              reject, final);
            $rootScope.$digest();
          });

          describe('check called', function () {
            checkCalled(false);
          });

          it('should have called reject()', function () {
            expect(reject).toHaveBeenCalledWith(response);
          });

          it('should have called final()', function () {
            expect(final).toHaveBeenCalled();
          });
        });
      });
    });

    describe('.toggleShow()', function() {
      var toggle;
      var enableNgClass;
      var reset;
      beforeEach(function () {
        toggle = jasmine.createSpy('1');
        enableNgClass = jasmine.createSpy('2');
        reset = jasmine.createSpy('3');
        service.toggleShow(toggle, enableNgClass, reset);
        $rootScope.$digest();
      });

      it('should have called toggle()', function () {
        expect(toggle).toHaveBeenCalled();
      });

      it('should have called enableNgClass()', function () {
        expect(enableNgClass).toHaveBeenCalled();
      });

      it('should have called reset()', function () {
        expect(reset).toHaveBeenCalled();
      });

    })
  })
})();

