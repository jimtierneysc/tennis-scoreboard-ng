(function() {
  'use strict';

  describe('service Team', function() {
    var service;
    var $httpBackend;

    beforeEach(module('frontend'));
    beforeEach(inject(function(_teamsResource_, _$httpBackend_) {
      service = _teamsResource_;
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

    describe('getTeams function', function() {
      it('should exist', function() {
        expect(service.getTeams).not.toEqual(null);
      });

      it('should return data', function() {
        $httpBackend.when('GET',  service.path).respond(200, [{name: 'aname'}]);
        var data = null;
        service.getTeams().query(function(response) {
          data = response;
        },
        function() {

        });
        $httpBackend.flush();
        expect(data).toEqual(jasmine.any(Array));
        expect(data.length === 1).toBeTruthy();
        expect(data[0]).toEqual(jasmine.any(Object));
      });

      it('should log a error', function() {
        $httpBackend.when('GET',  service.path).respond(500);
        var error = false;
        service.getTeams().query(function() {
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

