(function () {
  'use strict';

  describe('loadingHelper service', function () {
    var service;

    beforeEach(module('frontend'));

    beforeEach(function () {
      inject(function (_loadingHelper_) {
        service = _loadingHelper_;
      });
    });

    it('should be a function', function () {
      expect(service).toEqual(jasmine.any(Function));
    });

    describe('activate', function () {
      var vm;

      beforeEach(function () {
        vm = {};
        service(vm);
      });

      it('should support loading', function () {
        expect(vm).toSupportLoading();
      });

      it('should be loading initially', function () {
        // custom matcher
        expect(vm).toBeLoading();
      });

      describe('loading failed', function () {

        beforeEach(function () {
          var response = {statusText: STATUSTEXT};
          vm.updateLoadingFailed(response);
        });

        var STATUSTEXT = 'abcd';

        it('should have .loadingFailedMessage', function () {
          expect(vm.loadingFailedMessage).toMatch(STATUSTEXT);
        });

        it('should have failed', function () {
          // custom matcher
          expect(vm).toFailLoading();
        });
      });

      describe('loading completed', function () {
        beforeEach(function () {
          vm.updateLoadingCompleted();
        });

        it('should not have failed', function () {
          // custom matcher
          expect(vm).not.toFailLoading();
        });
      })
    })
  });

  /*global MatcherHelper*/

  beforeEach(function () {
    var matchers = {
      toFailLoading: function () {
        return {
          compare: function (vm) {
            var helper = new MatcherHelper(vm);
            if (vm.loading)
              helper.fail('expect not to be .loading');
            if (!vm.loadingFailed)
              helper.fail('expect to be .loadingFailed');
            return helper.getResult();
          }
        }
      },
      toBeLoading: function () {
        return {
          compare: function (vm) {
            var helper = new MatcherHelper(vm);
            if (!vm.loading)
              helper.fail('expect to be .loading');
            return helper.getResult();
          }
        }
      },
      // toSupportLoading matcher
      // Validate loading members
      // Usage: expect(vm).supportLoading();
      toSupportLoading: function () {
        return {
          compare: compare
        };
        function compare(vm) {
          var helper = new MatcherHelper(vm);

          helper.checkFunction('updateLoadingCompleted');
          helper.checkFunction('updateLoadingFailed');
          helper.checkBoolean('loading');
          helper.checkBoolean('loadingFailed');
          helper.checkString('loadingFailedMessage', false);

          return helper.getResult();
        }
      }
    };

    jasmine.addMatchers(matchers);
  });


})();

