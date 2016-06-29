(function () {
  'use strict';

  describe('directive credentials form', function () {

    var compile, scope, directiveElem, okText;

    beforeEach(module('frontend'));

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
    });

    function getCompiledElement(html) {
      var element = angular.element(html);
      var compiledElement = compile(element)(scope);
      scope.$digest();
      return compiledElement;
    }

    it('submit should be a function', function(){
      var isolatedScope = directiveElem.isolateScope();

      expect(typeof(isolatedScope.submit)).toEqual('function');
    });


    it('should call submit method', function () {
      var isolatedScope = directiveElem.isolateScope();
      isolatedScope.submit();

      expect(scope.asubmit).toHaveBeenCalled();
    });

    it('errors should be two-way bound', function(){
      var isolatedScope = directiveElem.isolateScope();

      var value = {errors: 'one'};

      isolatedScope.errors = value;
      scope.$digest();

      expect(scope.aerrors).toEqual(value);
    });

    it('entity should be two-way bound', function(){
      var isolatedScope = directiveElem.isolateScope();

      var value = {name: 'one'};

      isolatedScope.entity = value;
      scope.$digest();

      expect(scope.aentity).toEqual(value);
    });

    it('should have button element', function () {
      expect(directiveElem.find('button').length).toEqual(1);
    });

    it('should have button text', function () {
      expect(directiveElem.find('button')[0].innerText).toEqual(okText);
    });

  });
})();

