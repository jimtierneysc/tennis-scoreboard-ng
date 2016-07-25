(function() {
  'use strict';

  fdescribe('sessionResource service', function() {
    var service;
    var $httpBackend;

    beforeEach(module('frontend-auth'));
    beforeEach(function() {
      inject(function(_sessionResource_, _$httpBackend_) {
        service = _sessionResource_;
        $httpBackend = _$httpBackend_;
      })
    });

    describe('.path', function() {
      it('should have .path', function() {
        expect(service.path).not.toEqual(null);
      });
    });

    describe('.getSession()', function() {
      it('should have .getSession()', function() {
        expect(service.getSession).not.toEqual(null);
      });

      it('should return data', function() {
        $httpBackend.expect('POST',  service.path).respond(200, {auth_token: 'atoken'});
        var data = null;
        service.getSession().login(function(response) {
          data = response;
        },
        function() {

        });
        $httpBackend.flush();
        expect(data).toEqual(jasmine.any(Object));
      });

      it('should return error', function() {
        $httpBackend.expect('POST',  service.path).respond(500);
        var error = false;
        service.getSession().login(function() {
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

