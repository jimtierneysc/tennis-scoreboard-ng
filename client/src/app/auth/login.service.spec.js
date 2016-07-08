(function() {
  'use strict';

  describe('service Login', function() {
    var service;
    var $httpBackend;

    beforeEach(module('frontend'));
    beforeEach(function() {
      inject(function(_loginResource_, _$httpBackend_) {
        service = _loginResource_;
        $httpBackend = _$httpBackend_;
      })
    });

    describe('.path', function() {
      it('should exist', function() {
        expect(service.path).not.toEqual(null);
      });
    });

    describe('.getLogin()', function() {
      it('exists', function() {
        expect(service.getLogin).not.toEqual(null);
      });

      it('returns data', function() {
        $httpBackend.expect('POST',  service.path).respond(200, {auth_token: 'atoken'});
        var data = null;
        service.getLogin().login(function(response) {
          data = response;
        },
        function() {

        });
        $httpBackend.flush();
        expect(data).toEqual(jasmine.any(Object));
      });

      it('returns error', function() {
        $httpBackend.expect('POST',  service.path).respond(500);
        var error = false;
        service.getLogin().login(function() {
          },
          function() {
            error = true;

          });
        $httpBackend.flush();
        expect(error).toEqual(true);
      });
    });
  });
})();

