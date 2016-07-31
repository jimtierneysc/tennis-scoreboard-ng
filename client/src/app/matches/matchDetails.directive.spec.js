(function () {
  'use strict';

  describe('feMatchDetails directive', function () {
    var compiledDirective;
    var scope;
    var isolatedScope;
    var element;

    beforeEach(module('frontendMatches'));

    beforeEach(inject(function ($compile, $rootScope) {

      scope = $rootScope.$new();
      scope.amatch = {};

      var html = ('<fe-match-details ' +
      'match="amatch" ' +
      '></fe-match-details>');

      element = angular.element(html);

      compiledDirective = $compile(element)(scope);
      scope.$digest();
      isolatedScope = compiledDirective.isolateScope();
    }));

    describe('isolated scope', function () {

      it('should have .match', function () {
        expect(isolatedScope.match).toBe(scope.amatch);
      });

      // TODO: Test elements

    });
  });
})();
