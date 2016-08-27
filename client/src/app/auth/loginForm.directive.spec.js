(function () {
  'use strict';

  describe('feLoginForm directive', function () {

    var compile, scope, directiveElem;
    var isolatedScope;
    var vm;

    beforeEach(module('frontendAuth'));

    beforeEach(function () {
      inject(function ($compile, $rootScope) {
        compile = $compile;
        scope = $rootScope.$new();
      });

      var html = ('<fe-login-form ' +
      '></fe-login-form>');

      directiveElem = getCompiledElement(html);
      isolatedScope = directiveElem.isolateScope();
      vm = isolatedScope.vm;
    });

    function getCompiledElement(html) {
      var element = angular.element(html);
      var compiledElement = compile(element)(scope);
      scope.$digest();
      return compiledElement;
    }

    describe('members', function () {
      it('should have .submit()', function () {
        expect(vm.submit).toEqual(jasmine.any(Function));
      });

      it('should have .clearErrors()', function () {
        expect(vm.clearErrors).toEqual(jasmine.any(Function));
      });

      it('should have .errors', function () {
        expect(vm.errors).toEqual(jasmine.any(Object));
      });

      it('should have .entity', function () {
        expect(vm.entity).toEqual(jasmine.any(Object));
      });
    });

    describe('.clearErrors', function () {
      var sampleErrors = {'one': [], 'two': [], 'three': []};
      var existNames = ['one', 'three'];
      var expected = {'one': null, 'two': [], three: null};

      beforeEach(function () {
        vm.errors = angular.copy(sampleErrors);
        vm.clearErrors(vm.errors, existNames);
      });

      it('should remove errors', function () {
        expect(vm.errors).toEqual(expected);
      });
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
        });

        it('should support errors', function () {
          expect(vm).toSupportErrors();
        });
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

      });
    });
  });
})();


