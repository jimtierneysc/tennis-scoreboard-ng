(function() {
  'use strict';

  describe('userResource service', function() {
    var service;
    var $httpBackend;

    beforeEach(module('app.auth'));

    beforeEach(function() {
      inject(function(_userResource_, _$httpBackend_) {
        service = _userResource_;
        $httpBackend = _$httpBackend_;
      })
    });

    describe('.path', function() {
      it('should have .path', function() {
        expect(service.path).not.toEqual(null);
      });
    });

    describe('.getUser()', function() {
      it('should have .getUser()', function() {
        expect(service.getUser).not.toEqual(null);
      });

      it('should resolve when OK', function() {
        $httpBackend.expect('GET', service.path).respond(200, {username: 'auser'});
        var data = null;
        service.getUser().get(function(response) {
          data = response;
        },
        function() {

        });
        $httpBackend.flush();
        expect(data).toEqual(jasmine.any(Object));
      });

      it('should reject when error', function() {
        $httpBackend.expect('GET', service.path).respond(500);
        var error = false;
        service.getUser().get(function() {
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

