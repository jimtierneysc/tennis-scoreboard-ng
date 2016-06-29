(function () {
  'use strict';

  describe('helper errors', function () {

    beforeEach(module('frontend'));

    describe('service', function () {
      var service;

      beforeEach(function () {

        inject(function (_errorsHelper_) {
          service = _errorsHelper_;
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
        var map = {aprefix: null};
        var data = {aprefix: 'one', a: 'two', b: 'three'};
        var expected = {aprefix: ['one'], other: ['two', 'three']}
        var STATUS = 'status message'

        beforeEach(function () {
          service.activate(vm, map);
        });

        it('should have errors function', function () {
          expect(vm.errorsOfResponse).toEqual(jasmine.any(Function));
        });

        describe('errors in response.data', function () {
          var errorsOfResponse;

          beforeEach(function () {
            service.activate(vm, map);
            errorsOfResponse = vm.errorsOfResponse({data: data, statusText: STATUS});
          });

          it('should have errors', function () {
            expect(errorsOfResponse).toEqual(expected);
          });

        });

        describe('errors in response.data.errors', function () {
          var errorsOfResponse;

          beforeEach(function () {
            service.activate(vm, map);
            errorsOfResponse = vm.errorsOfResponse({data: {errors: data}, statusText: STATUS});
          });

          it('should have errors', function () {
            expect(errorsOfResponse).toEqual(expected);
          });

        });

        describe('errors in statusText', function () {
          var errorsOfResponse;

          beforeEach(function () {
            service.activate(vm, map);
            errorsOfResponse = vm.errorsOfResponse({statusText: STATUS});
          });

          it('should have errors', function () {
            expect(errorsOfResponse).toEqual({other: [STATUS]});
          });

        });

      });

    })

  })
})();

