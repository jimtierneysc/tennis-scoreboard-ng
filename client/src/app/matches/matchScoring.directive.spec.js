(function () {
  'use strict';

  fdescribe('feMatchScoring directive', function () {
    var compiledDirective;
    var scope;
    var isolatedScope;
    var element;

    beforeEach(module('frontend-matches'));

    beforeEach(inject(function ($compile, $rootScope) {

      var match = {title: 'atitle', doubles: true};

      scope = $rootScope.$new();
      scope.amatch = match;

      var html = ('<fe-match-scoring ' +
      'match="amatch" ' +
      '></fe-match-scoring>');

      element = angular.element(html);

      compiledDirective = $compile(element)(scope);
      scope.$digest();
      isolatedScope = compiledDirective.isolateScope();
    }));


    describe('isolated scope', function () {
      it('should have scope', function () {
        expect(isolatedScope).not.toBe(null);
      });

      it('should have .match', function () {
        expect(isolatedScope.match).toBe(scope.amatch);
      });

      // TODO: Test HTML elements

    });
  });
})();
