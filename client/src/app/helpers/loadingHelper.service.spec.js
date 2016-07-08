(function () {
  'use strict';

  describe('helper loading', function () {
    var service;

    beforeEach(module('frontend'));

    beforeEach(function () {
      inject(function (_loadingHelper_) {
        service = _loadingHelper_;
      });
    });

    describe('members', function () {
      it('is function', function () {
        expect(service).toEqual(jasmine.any(Function));
      });
    });

    describe('activate', function () {
      var vm;

      beforeEach(function () {
        vm = {};
        service(vm);
      });

      describe('members', function () {
        it('has .updateLoadingCompleted()', function () {
          expect(vm.updateLoadingCompleted).toEqual(jasmine.any(Function));
        });

        it('has .updateLoadingFailed()', function () {
          expect(vm.updateLoadingFailed).toEqual(jasmine.any(Function));
        });

        it('has .loading', function () {
          expect(vm.loading).toEqual(jasmine.any(Boolean));
        });

        it('has .loadingFailed', function () {
          expect(vm.loadingFailed).toEqual(jasmine.any(Boolean));
        });

        it('has .loading', function () {
          expect(vm.loading).toEqual(true);
        });

        it('is not .loadingFailed', function () {
          expect(vm.loadingFailed).toEqual(false);
        });
      });

      describe('loading failed', function () {

        beforeEach(function () {
          var response = {statusText: STATUSTEXT};
          vm.updateLoadingFailed(response);
        });

        var STATUSTEXT = 'abcd';

        it('has .loadingFailedMessage', function () {
          expect(vm.loadingFailedMessage).toMatch(STATUSTEXT);
        });

        it('is .loadingFailed', function () {
          expect(vm.loadingFailed).toEqual(true);
        });

        it('is not .loading', function () {
          expect(vm.loading).toEqual(false);
        })
      });

      describe('loading completed', function () {
        beforeEach(function () {
          vm.updateLoadingCompleted();
        });

        it('is not .loadingFailed', function () {
          expect(vm.loadingFailed).toEqual(false);
        });

        it('is not .loading', function () {
          expect(vm.loading).toEqual(false);
        })
      })
    })
  })
})();

