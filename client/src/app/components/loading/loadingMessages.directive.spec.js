(function () {
  'use strict';

  describe('feLoadingMessages directive', function () {
    var compiledDirective;
    var scope;
    var isolatedScope;
    var element;

    beforeEach(module('app.components'));

    beforeEach(inject(function ($compile, $rootScope) {

      scope = $rootScope.$new();
      scope.aloading = {};

      var html = ('<fe-loading-messages ' +
      'loading="aloading" ' +
      '></fe-loading-messages>');

      element = angular.element(html);

      compiledDirective = $compile(element)(scope);
      scope.$digest();
      isolatedScope = compiledDirective.isolateScope();
    }));

    describe('isolated scope', function () {

      it('should have .loading', function () {
        expect(isolatedScope.loading).toBe(scope.aloading);
      });

    });
  });
})();
