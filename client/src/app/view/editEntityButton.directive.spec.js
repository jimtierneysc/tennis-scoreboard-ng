(function () {
  'use strict';

  describe('feEditEntityButton directive', function () {
    var compiledDirective;
    var scope;
    var isolatedScope;
    var element;

    beforeEach(module('frontendView'));

    beforeEach(inject(function ($compile, $rootScope) {

      scope = $rootScope.$new();
      scope.acanmodify = true;
      scope.aedit = jasmine.createSpy('onSubmit');
      scope.aentity = {name: 'abc'};

      var html = ('<fe-edit-entity-button ' +
      'edit-entity="aedit()" ' +
      'entity="aentity" ' +
      'can-modify="acanmodify" '  +
      '></fe-edit-entity-button>');

      element = angular.element(html);

      compiledDirective = $compile(element)(scope);
      scope.$digest();
      isolatedScope = compiledDirective.isolateScope();
    }));

    describe('isolated scope', function () {

      it('should have .editEntity()', function () {
        isolatedScope.editEntity();
        expect(scope.aedit).toHaveBeenCalled();
      });

      it('should have .canModify', function () {
        expect(isolatedScope.canModify).toBe(true);
      });

      it('should have .entity', function () {
        expect(isolatedScope.entity).toBe(scope.aentity)
      });

      // TODO: Test form elements

    });
  });
})();
