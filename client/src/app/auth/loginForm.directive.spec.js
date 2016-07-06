(function () {
  'use strict';

  describe('directive loginForm', function () {

    var compile, scope, directiveElem;

    beforeEach(module('frontend'));

    beforeEach(function () {

      inject(function ($compile, $rootScope) {
        compile = $compile;
        scope = $rootScope.$new();
      });

      var html = ('<fe-login-form> ' +
      '</fe-login-form>');

      directiveElem = getCompiledElement(html);
    });

    function getCompiledElement(html) {
      var element = angular.element(html);
      var compiledElement = compile(element)(scope);
      scope.$digest();
      return compiledElement;
    }

    it('should have credentials-form element', function () {
      expect(directiveElem.find('fe-credentials-form').length).toEqual(1);
    });

    describe('controller', function () {
      var vm;

      beforeEach(function () {
        vm = scope.vm;
      });

      describe('members', function () {
        it('should have vm', function () {
          expect(vm).not.toEqual(null);
        });

        it('should have entity', function () {
          expect(vm.entity).toEqual(jasmine.any(Object));
        });

        it('should have errors', function () {
          expect(vm.errors).toEqual(jasmine.any(Object));
        });

        it('should have submit', function () {
          expect(vm.submit).toEqual(jasmine.any(Function));
        })
      });

      describe('inputs', function () {
        var inputs;
        var username = 'someuser';
        var password = 'somepassword';
        beforeEach(function () {
          vm.entity.username = username;
          vm.entity.password = password;
          inputs = directiveElem.find('input');
          scope.$digest();
        });

        it('should have user name', function () {
          expect(inputs[0].value).toEqual(username)
        });

        it('should have password', function () {
          expect(inputs[1].value).toEqual(password)
        });

        it('should have password', function () {
          expect(inputs[1].value).toEqual(password)
        });

      });

      describe('submit', function () {

        beforeEach(function () {
          // username and password needed to make valid
          vm.entity.username = 'someuser';
          vm.entity.password = 'somepassword';
          scope.$digest();
        });

        describe('with button', function () {

          var btn = null;

          beforeEach(function () {
            var $httpBackend;
            inject(function (_$httpBackend_, loginResource) {
              $httpBackend = _$httpBackend_;
              $httpBackend.expect('POST', loginResource.path).respond(200, {auth_token: 'atoken'});
            });
            btn = directiveElem.find('button');
          });

          it('should have button', function () {
            expect(btn).not.toEqual(null);
          });

          it('should submit', function () {
            spyOn(vm, 'submit').and.callThrough();
            btn[0].click();
            expect(vm.submit).toHaveBeenCalled();
          })
        });

        describe('sets credentials', function() {
          var $httpBackend;
          var authenticationService;
          beforeEach(function() {
            inject(function (_$httpBackend_, loginResource) {
              $httpBackend = _$httpBackend_;
              $httpBackend.expect('POST', loginResource.path).respond(200, {auth_token: 'atoken'});
            });
            inject(function (_authenticationService_) {
              authenticationService = _authenticationService_;
            });
            authenticationService.clearCredentials();
          });

          it('should login', function() {
            vm.submit();
            $httpBackend.flush();
            expect(authenticationService.loggedIn).toBeTruthy();
          })
        });

        describe('errors', function () {
          var errors = {
            password: 'password error',
            username: 'username error',
            somethingelse: 'whatever'
          };
          var expected = {
            password: ['password error'],
            username: ['username error'],
            other: ['whatever']
          };

          describe('password error', function () {
            var $httpBackend;
            beforeEach(function () {
              inject(function (_$httpBackend_, loginResource) {
                $httpBackend = _$httpBackend_;
                $httpBackend.expect('POST', loginResource.path).respond(500, errors);
              });
              vm.submit();
              $httpBackend.flush();
            });

            it('should have errors', function () {
              expect(vm.errors).toEqual(expected);
            });

          });
        });
      });
    })

  });
})();
