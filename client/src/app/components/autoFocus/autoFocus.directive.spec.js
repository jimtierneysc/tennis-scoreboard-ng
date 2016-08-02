(function () {
  'use strict';

  describe('feAutoFocus directive', function () {

    var compile, scope, $rootScope, $timeout;
    beforeEach(module('frontendComponents'));

    beforeEach(function () {

      inject(function ($compile, _$rootScope_, _$timeout_) {
        compile = $compile;
        $rootScope = _$rootScope_;
        scope = $rootScope.$new();
        // by defining autoFocus, we can tell if autoFocus directive executed
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
        var html = ('<div><input name="edit1" type="text"><input name="edit2" type="text" fe-auto-focus></div>');
        directiveElem = getCompiledElement(html);
      });

      it('should have input elements', function () {
        expect(directiveElem.find('input').length).toEqual(2);
      });

      it('should have focus', function () {
        $timeout.flush();  // Give directive time to set focus
        expect(scope.autoFocused).toEqual('edit2');
      });
    });

    describe('attribute with value', function(){
      var directiveElem;

      beforeEach(function() {
        var html = ('<div><input name="edit1" type="text"><input name="edit2" type="text" fe-auto-focus="focusedit2"></div>');
        directiveElem = getCompiledElement(html);
      });

      it('should have input elements', function () {
        expect(directiveElem.find('input').length).toEqual(2);
      });

      describe('initial state', function() {

        it('should not have focus', function () {
          expect(scope.autoFocused).toEqual(null);
        });
      });

      describe('use autoFocus service', function() {
        var autoFocus;
        beforeEach(function() {
          inject(function(_autoFocus_){
            autoFocus = _autoFocus_;
          });
        });

        it('should have focus', function () {
          autoFocus(scope, 'focusedit2');
          $timeout.flush();
          expect(scope.autoFocused).toEqual('edit2');
        });
      });
    })
  });
})();
