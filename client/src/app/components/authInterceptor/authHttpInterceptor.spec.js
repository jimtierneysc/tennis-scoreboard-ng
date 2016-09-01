(function () {
  'use strict';

  describe('authHttpInterceptor service', function () {
    var service;
    var $rootScope;

    beforeEach(module('app.components'));

    beforeEach(function () {
      inject(function (_authHttpInterceptor_, _$rootScope_) {
        service = _authHttpInterceptor_;
        $rootScope = _$rootScope_;
      });
    });

    describe('members', function () {
      it('should have .responseError()', function () {
        expect(service.responseError).toEqual(jasmine.any(Function));
      });

      it('should have .subscribeUnauthorized()', function () {
        expect(service.subscribeUnauthorized).toEqual(jasmine.any(Function));
      });
    });

    describe('when .subscribeUnauthorized()', function () {
      var notified;
      var scope;
      beforeEach(function() {
        scope = $rootScope.$new();
        notified = false;
        service.subscribeUnauthorized(scope, function() {
          notified = true;
        });
      });

      it('should be notified when 401', function () {
        service.responseError({status: 401});
        expect(notified).toBeTruthy();
      });

      it('should not be notified when 403', function () {
        service.responseError({status: 403});
        expect(notified).toBeFalsy();
      });
    });
  });


})();

