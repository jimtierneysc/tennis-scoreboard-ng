(function () {
  'use strict';

  describe('feMatchScoring directive', function () {
    var compiledDirective;
    var scope;
    var isolatedScope;
    var element;

    beforeEach(module('app.matches'));

    beforeEach(inject(function ($compile, $rootScope) {

      scope = $rootScope.$new();
      scope.amatch = {};

      var html = ('<fe-match-scoring ' +
      'match="amatch" ' +
      '></fe-match-scoring>');

      element = angular.element(html);

      compiledDirective = $compile(element)(scope);
      scope.$digest();
      isolatedScope = compiledDirective.isolateScope();
    }));

    describe('isolated scope', function () {

      it('should have .match', function () {
        expect(isolatedScope.match).toBe(scope.amatch);
      });

    });
  });
})();
