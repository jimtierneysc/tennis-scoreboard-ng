(function () {
  'use strict';

  describe('feCredentialsForm directive', function () {

    var compile, scope, directiveElem, okText;
    var isolatedScope;

    beforeEach(module('frontendAuth'));

    beforeEach(function () {
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
      isolatedScope = directiveElem.isolateScope();
    });

    function getCompiledElement(html) {
      var element = angular.element(html);
      var compiledElement = compile(element)(scope);
      scope.$digest();
      return compiledElement;
    }

    it('should have .submit()', function () {
      expect(isolatedScope.submit).toEqual(jasmine.any(Function));
    });

    it('should call .submit()', function () {
      isolatedScope.submit();
      expect(scope.asubmit).toHaveBeenCalled();
    });

    it('should two-way bind .errors', function () {
      var value = {errors: 'one'};

      isolatedScope.errors = value;
      scope.$digest();

      expect(scope.aerrors).toEqual(value);
    });

    it('should two-way bind .entity', function () {
      var value = {name: 'one'};

      isolatedScope.entity = value;
      scope.$digest();

      expect(scope.aentity).toEqual(value);
    });

    describe('elements', function () {
      it('should have button', function () {
        expect(directiveElem.find('button').length).toEqual(1);
      });

      it('should have button text', function () {
        expect(directiveElem.find('button')[0].innerText).toEqual(okText);
      });

    });

  });
})();

