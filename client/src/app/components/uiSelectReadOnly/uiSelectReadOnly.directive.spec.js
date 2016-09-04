
(function () {
  'use strict';

  fdescribe('feUiSelectReadOnly directive', function () {

    var compile, scope, $rootScope, $timeout;
    beforeEach(module('app.components'));

    beforeEach(function () {

      inject(function ($compile, _$rootScope_, _$timeout_) {
        compile = $compile;
        $rootScope = _$rootScope_;
        scope = $rootScope.$new();
        // initialize autoFocused flag
        scope.autoFocused = null;
        $timeout = _$timeout_;
      });
    });

    function getCompiledElement(html) {
      var element = angular.element(html);
      var compiledElement = compile(element)(scope);
      scope.$digest();
      return compiledElement;
    }

    describe('attribute with no value', function(){
      var directiveElem;

      beforeEach(function() {
        var html =
          '<ui-select fe-ui-select-read-only search-enabled="false"> ' +
          '</ui-select>';
        directiveElem = getCompiledElement(html);
      });

      it('should have input elements', function () {
        expect(directiveElem.find('input').length).toEqual(1);
      });

    });

  });

})();
