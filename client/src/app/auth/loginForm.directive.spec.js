(function () {
  'use strict';

  describe('feLoginForm directive', function () {

    var compile, scope, directiveElem;

    beforeEach(module('frontendAuth'));
    // beforeEach(module(function ($provide) {
    //   $provide.factory('validateCredentials', function () {
    //     return function(data) {
    //       // return $q.$defer().resolve(data);
    //       inject(function(_$q_) {
    //          $q = _$q_;
    //       });
    //       var deferred = $q.$defer();
    //       deferred.resolve(data);
    //       return deferred;
    //     };
    //   });
    // }));
    afterEach(function() {
      localStorage.clear();
    });

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

    it('should have fe-credentials-form element', function () {
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

        it('should have .entity', function () {
          expect(vm.entity).toEqual(jasmine.any(Object));
        });

        it('should have .errors', function () {
          expect(vm.errors).toEqual(jasmine.any(Object));
        });

        it('should have .submit()', function () {
          expect(vm.submit).toEqual(jasmine.any(Function));
        })
      });

      describe('input elements', function () {
        var inputs;
        var username = 'loginForm username';
        var password = 'loginForm password';
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
      });

      describe('.submit()', function () {
        var waitIndicator;
        beforeEach(function () {
          inject(function (_waitIndicator_) {
            waitIndicator = _waitIndicator_;
          });
          spyOn(waitIndicator, 'beginWait').and.callThrough();
        });

        function expectWaitIndicator() {
          it('should call .beginWait()', function () {
            expect(waitIndicator.beginWait).toHaveBeenCalled();
          });

          it('should not be .waiting when finished', function () {
            expect(waitIndicator.waiting()).toBeFalsy();
          });
        }

        beforeEach(function () {
          // username and password needed to make valid
          vm.entity.username = 'loginForm someuser';
          vm.entity.password = 'loginForm somepassword';
          scope.$digest();
        });

        describe('with button', function () {

          var btn = null;

          beforeEach(function () {
            btn = directiveElem.find('button');
          });

          it('should have button', function () {
            expect(btn).not.toEqual(null);
          });

          it('should call .submit() when click()', function () {
            spyOn(vm, 'submit');
            btn[0].click();
            expect(vm.submit).toHaveBeenCalled();
          })
        });

        describe('sets credentials', function () {
          var $httpBackend;
          var userCredentials;
          beforeEach(function () {
            inject(function (_$httpBackend_, sessionResource) {
              $httpBackend = _$httpBackend_;
              $httpBackend.expect('POST', sessionResource.path).respond(200, {auth_token: 'atoken'});
            });
            inject(function (_userCredentials_) {
              userCredentials = _userCredentials_;
            });
            userCredentials.clearCredentials();
            vm.submit();
            $httpBackend.flush();
          });

          it('should be logged in', function () {
            expect(userCredentials.loggedIn).toBeTruthy();
          });

          expectWaitIndicator();
        });

        describe('has password error', function () {
          var errors = {
            password: 'password error',
            username: 'username error',
            somethingelse: 'whatever'
          };
          var expected = {
            password: ['password error'],
            username: ['username error'],
            other: ['Somethingelse whatever']
          };

          var $httpBackend;
          beforeEach(function () {
            inject(function (_$httpBackend_, sessionResource) {
              $httpBackend = _$httpBackend_;
              $httpBackend.expect('POST', sessionResource.path).respond(500, errors);
            });
            vm.submit();
            $httpBackend.flush();
          });

          it('should have expected .errors', function () {
            expect(vm.errors).toEqual(expected);
          });

          expectWaitIndicator();
        });
      });
    })
  });
})();
