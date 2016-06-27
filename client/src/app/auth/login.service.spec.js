(function() {
  'use strict';

  describe('service Login', function() {
    var service;
    var $httpBackend;

    beforeEach(module('frontend'));
    beforeEach(inject(function(_loginResource_, _$httpBackend_) {
      service = _loginResource_;
      $httpBackend = _$httpBackend_;
    }));

    it('should be registered', function() {
      expect(service).not.toEqual(null);
    });

    describe('path variable', function() {
      it('should exist', function() {
        expect(service.path).not.toEqual(null);
      });
    });

    describe('getLogin function', function() {
      it('should exist', function() {
        expect(service.getLogin).not.toEqual(null);
      });

      it('should return data', function() {
        $httpBackend.when('POST',  service.path).respond(200, {auth_token: 'atoken'});
        var data = null;
        service.getLogin().login(function(response) {
          data = response;
        },
        function() {

        });
        $httpBackend.flush();
        expect(data).toEqual(jasmine.any(Object));
      });

      it('should return error', function() {
        $httpBackend.when('POST',  service.path).respond(500);
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

