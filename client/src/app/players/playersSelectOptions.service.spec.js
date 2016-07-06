(function () {
  'use strict';

  describe('playersSelectOptions', function () {

    var path;
    var $httpBackend;
    var service;
    var $rootScope;
    var list = [
      {name: 'player1', id: 1, something: 'xyz'},
      {name: 'player2', id: 2}
    ];
    var options = [
      {name: 'player1', id: 1},
      {name: 'player2', id: 2}
    ];

    beforeEach(module('frontend'));
    beforeEach(function () {
      inject(function (_crudResource_, _playersResource_,
                       _$httpBackend_, _playersSelectOptions_, _$rootScope_) {
        $rootScope = _$rootScope_;
        service = _playersSelectOptions_;
        path = _crudResource_.getPath(_playersResource_);
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
          function(value) {
            failed = value;
          });
        $httpBackend.flush();
        $rootScope.$digest();
      });

      it('should have empty list', function () {
        expect(failed).toBeTruthy;
      })
    });

  });
})();
