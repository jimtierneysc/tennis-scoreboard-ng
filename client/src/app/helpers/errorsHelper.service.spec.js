(function () {
  'use strict';

  describe('helper errors', function () {
    var map = {aprefix: null};
    var data = {aprefix: 'one', a: 'two', b: 'three'};
    var expected = {aprefix: ['one'], other: ['two', 'three']}
    var STATUS = 'status message'
    var service;

    beforeEach(module('frontend'));

    beforeEach(function () {
      inject(function (_errorsHelper_) {
        service = _errorsHelper_;
      });
    });

    describe('members', function () {
      it('is function', function () {
        expect(service).toEqual(jasmine.any(Function));
      });
    });

    describe('activate', function () {
      var vm;
      beforeEach(function() {
        vm = {};
        service(vm, map)
      });

      describe('errors in response.data', function () {
        var errorsOfResponse;

        beforeEach(function () {
          errorsOfResponse = vm.errorsOfResponse({data: data, statusText: STATUS});
        });

        it('has expected errors', function () {
          expect(errorsOfResponse).toEqual(expected);
        });
      });

      describe('errors in response.data.errors', function () {
        var errorsOfResponse;

        beforeEach(function () {
          errorsOfResponse = vm.errorsOfResponse({data: {errors: data}, statusText: STATUS});
        });

        it('has expected errors', function () {
          expect(errorsOfResponse).toEqual(expected);
        });
      });

      describe('errors in statusText', function () {
        var errorsOfResponse;

        beforeEach(function () {
          errorsOfResponse = vm.errorsOfResponse({statusText: STATUS});
        });

        it('has expected errors', function () {
          expect(errorsOfResponse).toEqual({other: [STATUS]});
        });
      });
    })
  });
})();

