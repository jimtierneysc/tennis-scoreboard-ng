(function () {
  'use strict';

  describe('feCrudPage directive', function () {
    var compiledDirective;
    var scope;
    var isolatedScope;
    var element;

    beforeEach(module('frontendCrud'));

    beforeEach(inject(function ($compile, $rootScope) {

      scope = $rootScope.$new();
      scope.aloading = {};
      scope.aentityList = {};
      scope.anewEntity = {};

      var html = ('<fe-crud-page ' +
      'loading="aloading" ' +
      'entity-list="aentityList" ' +
      'new-entity="anewEntity" ' +
      '>' +
      '<new>new content</new>' +
      '<list>list content</list>' +
      '</fe-crud-page>');


      element = angular.element(html);

      compiledDirective = $compile(element)(scope);
      scope.$digest();
      isolatedScope = compiledDirective.isolateScope();
    }));

    describe('isolated scope', function () {

      it('should have .entityList', function () {
        expect(isolatedScope.entityList).toBe(scope.aentityList)
      });

      it('should have .newEntity', function () {
        expect(isolatedScope.newEntity).toBe(scope.anewEntity)
      });

      it('should have .loading', function () {
        expect(isolatedScope.loading).toBe(scope.aloading)
      });

    });
  });
})();
