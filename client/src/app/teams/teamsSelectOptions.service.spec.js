(function () {
  'use strict';

  describe('teamsSelectOptions service', function () {

    var path;
    var $httpBackend;
    var service;
    var $rootScope;
    var options = [
      {name: 'team1', id: 1, first_player: 'f1', second_player: 's1'},
      {name: 'team2', id: 2, first_player: 'f2', second_player: 's2'}
    ];
    var list;
    (function() {
      list = angular.copy(options);
      list[0].extra = 'abc';
    })();

    beforeEach(module('app.teams'));

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
