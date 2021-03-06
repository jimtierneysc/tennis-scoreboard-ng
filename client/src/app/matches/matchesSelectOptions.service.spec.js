(function () {
  'use strict';

  describe('matchesSelectOptions service', function () {

    var path;
    var $httpBackend;
    var service;
    var $rootScope;
    var sampleResponse = [
      {title: 'match1', id: 1},
      {title: null, id: 2}
    ];
    var expectedOptionsList = [
      {title: 'match1', id: 1},
      {title: '(untitled)', id: 2}
    ];

    beforeEach(module('app.matches'));

    beforeEach(function () {
      inject(function (_crudResource_, _matchesPath_,
                       _$httpBackend_, _matchesSelectOptions_, _$rootScope_) {
        $rootScope = _$rootScope_;
        service = _matchesSelectOptions_;
        path = _crudResource_.getPath(_matchesPath_);
        $httpBackend = _$httpBackend_;
      });
    });

    describe('request success', function () {
      var result;
      beforeEach(function () {
        $httpBackend.expect('GET', path).respond(200, sampleResponse);
        service().then(
          function(value) {
            result = value;
          });
        $httpBackend.flush();
        $rootScope.$digest();
      });

      it('should return expected options list', function () {
        expect(result).toEqual(expectedOptionsList);
      })
    });

    describe('request failure', function () {
      var failed;
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

      it('should call failure function', function () {
        expect(failed).toBeTruthy();
      })
    });

  });
})();
