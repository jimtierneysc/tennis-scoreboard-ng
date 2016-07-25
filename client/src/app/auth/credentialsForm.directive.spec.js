(function () {
  'use strict';

  fdescribe('feCredentialsForm directive', function () {

    var compile, scope, directiveElem, okText;

    beforeEach(module('frontend-auth'));

    beforeEach(function () {
      localStorage.clear();
      inject(function ($compile, $rootScope) {
        compile = $compile;
        scope = $rootScope.$new();
      });

      scope.aerrors = {};
      scope.aentity = {};
      okText = 'A OK'
      scope.asubmit = jasmine.createSpy('submit');

      var html = ('<fe-credentials-form ' +
      'errors="aerrors" ' +
      'submit="asubmit()" ' +
      'entity="aentity" ' +
      'ok="' + "{{'" + okText + "'}}" + '"' +
      '></fe-credentials-form>');

      directiveElem = getCompiledElement(html);
    });

    function getCompiledElement(html) {
      var element = angular.element(html);
      var compiledElement = compile(element)(scope);
      scope.$digest();
      return compiledElement;
    }

    it('should have .submit()', function () {
      var isolatedScope = directiveElem.isolateScope();

      expect(isolatedScope.submit).toEqual(jasmine.any(Function));
    });


    it('should call .submit()', function () {
      var isolatedScope = directiveElem.isolateScope();
      isolatedScope.submit();

      expect(scope.asubmit).toHaveBeenCalled();
    });

    it('should two-way bind .errors', function () {
      var isolatedScope = directiveElem.isolateScope();

      var value = {errors: 'one'};

      isolatedScope.errors = value;
      scope.$digest();

      expect(scope.aerrors).toEqual(value);
    });

    it('should two-way bind .entity', function () {
      var isolatedScope = directiveElem.isolateScope();

      var value = {name: 'one'};

      isolatedScope.entity = value;
      scope.$digest();

      expect(scope.aentity).toEqual(value);
    });

    describe('elements', function () {
      it('should have button', function () {
        expect(directiveElem.find('button').length).toEqual(1);
      });

      it('should have correct button text', function () {
        expect(directiveElem.find('button')[0].innerText).toEqual(okText);
      });

    });

  });
})();

