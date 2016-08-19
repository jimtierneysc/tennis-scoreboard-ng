(function () {
  'use strict';

  describe('fePlayerForm directive', function () {
    var compiledDirective;
    var scope;
    var okText;
    var isolatedScope;
    var element;

    beforeEach(module('frontendPlayers'));

    beforeEach(inject(function ($compile, $rootScope) {

      okText = 'clickme';

      scope = $rootScope.$new();
      scope.aform = null;
      scope.aentity = {};
      scope.aerrors = {};
      scope.asubmit = jasmine.createSpy('onSubmit');
      scope.acancel = jasmine.createSpy('onCancel');

      var html = ('<fe-players-form ' +
      'form="aform" ' +
      'errors="aerrors" ' +
      'cancel="acancel()" ' +
      'submit="asubmit()" ' +
      'entity="aentity" ' +
      'ok="' + okText + '"' +
      '></fe-players-form>');

      element = angular.element(html);

      compiledDirective = $compile(element)(scope);
      scope.$digest();
      isolatedScope = compiledDirective.isolateScope();
    }));
    
    describe('isolated scope', function () {
      it('should have .form', function () {
        expect(isolatedScope.form).toEqual(scope.aform);
      });

      it('should have .errors', function () {
        expect(isolatedScope.errors).toBe(scope.aerrors);
      });

      it('should have .entity', function () {
        expect(isolatedScope.entity).toBe(scope.aentity);
      });

      it('should call .cancel()', function () {
        isolatedScope.cancel();
        expect(scope.acancel).toHaveBeenCalled();
      });

      it('should call .submit()', function () {
        isolatedScope.submit();
        expect(scope.asubmit).toHaveBeenCalled();
      });

      it('should have ok text', function () {
        expect(isolatedScope.ok).toEqual(okText);
      });

    });
  });
})();
