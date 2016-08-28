(function () {
  'use strict';

  describe('feCrudRow directive', function () {
    var compiledDirective;
    var scope;
    var isolatedScope;
    var element;

    beforeEach(module('frontendCrud'));

    beforeEach(inject(function ($compile, $rootScope) {

      scope = $rootScope.$new();
      scope.aentityList = {};
      scope.aeditEntity = {};
      scope.aentity = {};

      var html = ('<fe-crud-row ' +
      'vm="avm" ' +
      'entity="aentity" ' +
      'edit-entity="aeditEntity" ' +
      'entity-list="aentityList" ' +
      '>' +
        '<main>entity content</main>' +
        '<section>edit content</section>' +
      '</fe-crud-row>');

      element = angular.element(html);

      compiledDirective = $compile(element)(scope);
      scope.$digest();
      isolatedScope = compiledDirective.isolateScope();
    }));

    describe('isolated scope', function () {

      it('should have .entity', function () {
        expect(isolatedScope.entity).toBe(scope.aentity)
      });

      it('should have .entityList', function () {
        expect(isolatedScope.entityList).toBe(scope.aentityList)
      });

      it('should have .editEntity', function () {
        expect(isolatedScope.editEntity).toBe(scope.aeditEntity)
      });

    });
  });
})();
