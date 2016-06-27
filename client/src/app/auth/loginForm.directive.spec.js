(function () {
  'use strict';

  describe('loginForm directive', function () {

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

  });
})();
