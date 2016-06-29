(function () {
  'use strict';

  describe('directive autoFocus', function () {

    var compile, scope, directiveElem, $rootScope, $timeout;
    beforeEach(module('frontend'));

    beforeEach(function () {

      inject(function ($compile, _$rootScope_, _$timeout_) {
        compile = $compile;
        $rootScope = _$rootScope_;
        scope = $rootScope.$new();
        // special value set by directive
        scope.autoFocused = null;
        $timeout = _$timeout_;
      });

      var html = ('<div><input name="edit1" type="text"><input name="edit2" type="text" fe-auto-focus></div>');

      directiveElem = getCompiledElement(html);
    });

    function getCompiledElement(html) {
      var element = angular.element(html);
      var compiledElement = compile(element)(scope);
      scope.$digest();
      return compiledElement;
    }

    it('should have input elements', function () {
      expect(directiveElem.find('input').length).toEqual(2);
    });

    it('should set focus', function () {
      $timeout.flush();  // Give directive time to set focus
      expect(scope.autoFocused).toEqual('edit2');
    });

  });
})();
