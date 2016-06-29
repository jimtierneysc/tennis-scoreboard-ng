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
    
    describe('vm', function () {
      var vm;

      beforeEach(function () {
        vm = scope.vm;
      });

      it('should have members', function () {
        expect(vm).not.toEqual(null);
        expect(vm.entity).toEqual(jasmine.any(Object));
        expect(vm.errors).toEqual(jasmine.any(Object));
        expect(vm.submit).toEqual(jasmine.any(Function));
      })
    })
    
  });
})();
