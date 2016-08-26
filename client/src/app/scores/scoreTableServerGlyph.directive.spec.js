(function () {
  'use strict';

  describe('feScoreTableServerGlyph directive', function () {
    var compiledDirective;
    var scope;
    var isolatedScope;
    var element;

    beforeEach(module('frontendScores'));

    beforeEach(inject(function ($compile, $rootScope) {
      
      scope = $rootScope.$new();
      scope.ascores = {};
      scope.aplayer = 10;

      var html = ('<fe-score-table-server-glyph ' +
      'scores="ascores" ' +
      'player="aplayer" ' +
      'leftmost="true" ' +
      '></fe-score-table-server-glyph>');

      element = angular.element(html);

      compiledDirective = $compile(element)(scope);
      scope.$digest();
      isolatedScope = compiledDirective.isolateScope();
    }));

    describe('isolated scope', function () {

      it('should have .scores', function () {
        expect(isolatedScope.scores).toBe(scope.ascores);
      });

      it('should have .player', function () {
        expect(isolatedScope.opponent).toEqual(scope.aplayer);
      });

      it('should have .leftmost', function () {
        expect(isolatedScope.leftmost).toBeTruthy();
      });

      // TODO: Test elements

    });
  });
})();
