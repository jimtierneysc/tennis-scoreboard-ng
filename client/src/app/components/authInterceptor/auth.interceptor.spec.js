(function () {
  'use strict';

  describe('authInterceptor service', function () {
    var service;

    beforeEach(module('frontendComponents'));

    beforeEach(function () {
      inject(function (_authInterceptor_) {
        service = _authInterceptor_;
      });
    });

    describe('members', function () {
      it('should have .responseError', function () {
        expect(service.responseError).toEqual(jasmine.any(Function));
      });
    });
  });


})();

