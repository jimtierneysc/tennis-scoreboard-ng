(function () {
  'use strict';

  describe('feMatchOpponentPlayer directive', function () {
    var compiledDirective;
    var scope;
    var isolatedScope;
    var element;

    beforeEach(module('frontendMatches'));

    beforeEach(inject(function ($compile, $rootScope) {

      scope = $rootScope.$new();
      scope.aplayer = {};

      var html = ('<fe-match_opponent-player ' +
      'player="aplayer" ' +
      'period="true" ' +
      '></fe-match_opponent-player>');

      element = angular.element(html);

      compiledDirective = $compile(element)(scope);
      scope.$digest();
      isolatedScope = compiledDirective.isolateScope();
    }));

    describe('isolated scope', function () {

      it('should have .player', function () {
        expect(isolatedScope.player).toBe(scope.aplayer);
      });

      it('should have .period', function () {
        expect(isolatedScope.period).toBeTruthy();
      });

      // TODO: Test HTML elements

    });
  });
})();
