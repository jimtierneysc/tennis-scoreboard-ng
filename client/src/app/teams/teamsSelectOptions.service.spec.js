(function () {
  'use strict';

  describe('teamsSelectOptions service', function () {

    var path;
    var $httpBackend;
    var service;
    var $rootScope;
    var list = [
      {name: 'team1', id: 1, something: 'xyz'},
      {name: 'team2', id: 2}
    ];
    var options = [
      {name: 'team1', id: 1},
      {name: 'team2', id: 2}
    ];

    beforeEach(module('frontendTeams'));

    beforeEach(function () {
      inject(function (_crudResource_, _teamsPath_,
                       _$httpBackend_, _teamsSelectOptions_, _$rootScope_) {
        $rootScope = _$rootScope_;
        service = _teamsSelectOptions_;
        path = _crudResource_.getPath(_teamsPath_);
        $httpBackend = _$httpBackend_;
      });
    });

    describe('request success', function () {
      var result;
      beforeEach(function () {
        $httpBackend.expect('GET', path).respond(200, list);
        service().then(
          function(value) {
            result = value;
          });
        $httpBackend.flush();
        $rootScope.$digest();
      });

      it('should have list', function () {
        expect(result).toEqual(options);
      })
    });

    describe('request failure', function () {
      var failed = false;
      beforeEach(function () {
        $httpBackend.expect('GET', path).respond(500);
        service().then(
          function() {
          },
          function() {
            failed = true;
          });
        $httpBackend.flush();
        $rootScope.$digest();
      });

      it('should have empty list', function () {
        expect(failed).toBeTruthy();
      })
    });

  });
})();
