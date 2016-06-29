(function () {
  'use strict';

  describe('helper loading', function () {

    beforeEach(module('frontend'));

    describe('service', function () {
      var service;

      beforeEach(function () {

        inject(function (_loadingHelper_) {
          service = _loadingHelper_;
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

        beforeEach(function () {
          service.activate(vm);
        });

        it('should have completed function', function () {
          expect(vm.loadingHasCompleted).toEqual(jasmine.any(Function));
        });

        it('should have failed function', function () {
          expect(vm.loadingHasFailed).toEqual(jasmine.any(Function));
        });

        it('should have loading', function () {
          expect(vm.loading).toEqual(jasmine.any(Boolean));
        });

        it('should have loading failed', function () {
          expect(vm.loadingFailed).toEqual(jasmine.any(Boolean));
        });

        it('should be loading by default', function () {
          expect(vm.loading).toEqual(true);
        });

        it('should not fail by default', function () {
          expect(vm.loadingFailed).toEqual(false);
        });

      });

      describe('loading failed', function() {
        var vm = {};

        beforeEach(function () {
          service.activate(vm);
          var response = {statusText: STATUSTEXT};
          vm.loadingHasFailed(response);
        });

        var STATUSTEXT = 'abcd'

        it('should have status text', function() {
          expect(vm.loadingFailedMessage).toMatch(STATUSTEXT);
        });

        it('should have failed', function() {
          expect(vm.loadingFailed).toEqual(true);
        });

        it('should not be loading', function() {
          expect(vm.loading).toEqual(false);
        })

      });

      describe('loading completed', function() {
        var vm = {};

        beforeEach(function () {
          service.activate(vm);
          vm.loadingHasCompleted();
        });

        it('should not have failed', function() {
          expect(vm.loadingFailed).toEqual(false);
        });

        it('should not be loading', function() {
          expect(vm.loading).toEqual(false);
        })

      })
    })

  })
})();

