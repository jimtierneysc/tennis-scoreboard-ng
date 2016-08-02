(function () {
  'use strict';

  describe('validateCredentials service', function () {
    var service;
    var $httpBackend;
    var path;
    var $rootScope;

    beforeEach(module('frontendAuth'));
    beforeEach(function () {
      inject(function (_validateCredentials_) {
        service = _validateCredentials_;
      })
    });
    beforeEach(function () {
      inject(function (_userResource_, _$httpBackend_, _$rootScope_) {
        path = _userResource_.path;
        $httpBackend = _$httpBackend_;
        $rootScope = _$rootScope_;
      })
    });

    it('should be a function', function () {
      expect(service).toEqual(jasmine.any(Function));
    });

    describe('validate', function () {
      var credentials1;
      var credentials2;
      beforeEach(function () {
        credentials1 = {
          username: 'user1'
        };

        credentials2 = {
          username: 'user2'
        };
      });

      describe('when no http error', function () {
        beforeEach(function () {
          $httpBackend.expect('GET', path).respond(200, credentials1);
        });

        it('should validate when token is correct', function () {
          var result = false;
          service(credentials1).then(
            function () {
              result = true;
            }
          );
          $httpBackend.flush();
          expect(result).toBeTruthy();
        });


        it('should update user name when token is correct', function () {
          var result = null;
          service(credentials2).then(
            function (response) {
              result = response;
            }
          );
          $httpBackend.flush();
          expect(result.username).toEqual(credentials1.username);
        });
      });

      it('should not validate when HTTP error', function () {
        $httpBackend.expect('GET', path).respond(404);
        var result = true;
        service(credentials1).then(
          function () {
          },
          function () {
            result = false;
          });
        $httpBackend.flush();
        expect(result).toBeFalsy();
      });

      it('should not validate when no credentials', function () {
        var result = true;
        service(null).then(
          function () {
          },
          function () {
            result = false;
          });
        $rootScope.$digest();
        expect(result).toBeFalsy();
      });
    });
  });
})();

