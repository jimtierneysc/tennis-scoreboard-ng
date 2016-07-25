(function() {
  'use strict';

  fdescribe('userResource service', function() {
    var service;
    var $httpBackend;

    beforeEach(module('frontend-auth'));
    // beforeEach(module(function (_$provide_) {
    //   _$provide_.value('userCredentials', {
    //     loadCredentials: jasmine.createSpy()
    //   });
    // }));

    beforeEach(function() {
      inject(function(_userResource_, _$httpBackend_) {
        service = _userResource_;
        $httpBackend = _$httpBackend_;
      })
    });

    // beforeEach(
    // module(function($provide) {
    //   $provide.service('util', function() {
    //     this.isNumber = jasmine.createSpy('isNumber').andCallFake(function(num) {
    //       //a fake implementation
    //     });
    //     this.isDate = jasmine.createSpy('isDate').andCallFake(function(num) {
    //       //a fake implementation
    //     });
    //   });
    // }));

    describe('.path', function() {
      it('should have .path', function() {
        expect(service.path).not.toEqual(null);
      });
    });

    describe('.getUser()', function() {
      it('should have .getUser()', function() {
        expect(service.getUser).not.toEqual(null);
      });

      it('should return data', function() {
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

      it('should return error', function() {
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

