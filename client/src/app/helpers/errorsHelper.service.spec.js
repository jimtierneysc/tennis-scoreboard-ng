(function () {
  'use strict';

  describe('errorsHelper service', function () {
    var map = { names: ['aprefix']};
    var data = {aprefix: 'one', a_b: 'two', b: 'three'};
    var expected = {aprefix: ['one'], other: ['A b two', 'B three']};
    var STATUS = 'status message';
    var service;

    beforeEach(module('frontend'));

    beforeEach(function () {
      inject(function (_errorsHelper_) {
        service = _errorsHelper_;
      });
    });

      it('should be a function', function () {
        expect(service).toEqual(jasmine.any(Function));
      });

    describe('operation', function () {
      var vm;
      beforeEach(function() {
        vm = {};
        service(vm, map)
      });

      it('should support errors', function() {
        expect(vm).toSupportErrors();
      });

      describe('errors in response.data', function () {
        var errorsOfResponse;

        beforeEach(function () {
          errorsOfResponse = vm.errorsOfResponse({data: data, statusText: STATUS});
        });

        it('should have expected errors', function () {
          expect(errorsOfResponse).toEqual(expected);
        });
      });

      describe('errors in response.data.errors', function () {
        var errorsOfResponse;

        beforeEach(function () {
          errorsOfResponse = vm.errorsOfResponse({data: {errors: data}, statusText: STATUS});
        });

        it('should have expected errors', function () {
          expect(errorsOfResponse).toEqual(expected);
        });
      });

      describe('errors in response.statusText', function () {
        var errorsOfResponse;

        beforeEach(function () {
          errorsOfResponse = vm.errorsOfResponse({statusText: STATUS});
        });

        it('should have expected errors', function () {
          expect(errorsOfResponse).toEqual({other: ['Status ' + STATUS]});
        });
      });

      describe('errors in response no statusText', function () {
        var errorsOfResponse;

        beforeEach(function () {
          errorsOfResponse = vm.errorsOfResponse({unknownKey: STATUS});
        });

        it('should have expected errors', function () {
          expect(errorsOfResponse).toEqual({other: ['Status unexpected error']});
        });
      });
    })
  });

  /*global MatcherHelper*/

  beforeEach(function () {
    var matchers = {
      toSupportErrors: function () {
        return {
          compare: compare
        };
        function compare(vm) {
          var helper = new MatcherHelper(vm);

          helper.checkFunction('errorsOfResponse');
          return helper.getResult();
        }
      }
    };

    jasmine.addMatchers(matchers);
  });

})();

