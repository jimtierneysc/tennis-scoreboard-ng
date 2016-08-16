(function () {
  'use strict';

  describe('feDeleteEntityButton directive', function () {
    var compiledDirective;
    var scope;
    var isolatedScope;
    var element;

    beforeEach(module('frontendView'));

    beforeEach(inject(function ($compile, $rootScope) {

      scope = $rootScope.$new();
      scope.adelete = jasmine.createSpy('onCancel');
      scope.aentity = {name: 'xxx'}

      var html = ('<fe-delete-entity-button ' +
      'entity="aentity" ' +
      'delete-entity="adelete()" ' +
      '></fe-delete-entity-button>');

      element = angular.element(html);

      compiledDirective = $compile(element)(scope);
      scope.$digest();
      isolatedScope = compiledDirective.isolateScope();
    }));

    describe('isolated scope', function () {

      it('should have .deleteEntity()', function () {
        isolatedScope.deleteEntity();
        expect(scope.adelete).toHaveBeenCalled();
      });

      it('should have .entity', function () {
        expect(isolatedScope.entity).toBe(scope.aentity)
      });

      // TODO: Test form elements

    });
  });
})();
