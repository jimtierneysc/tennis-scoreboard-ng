(function () {
  'use strict';

  describe('feScoreTableGameTitle directive', function () {
    var compiledDirective;
    var scope;
    var isolatedScope;
    var element;

    beforeEach(module('frontendScores'));

    beforeEach(inject(function ($compile, $rootScope) {

      var game = {
      };

      scope = $rootScope.$new();
      scope.atitle = game;
      scope.averbose = true;
      scope.atiebreaker = true;

      var html = ('<fe-score-table-game-title ' +
      'title="atitle" ' +
      'verbose="averbose" ' +
      'tiebreaker="atiebreaker" ' +
      '></fe-score-table-game-title>');

      element = angular.element(html);

      compiledDirective = $compile(element)(scope);
      scope.$digest();
      isolatedScope = compiledDirective.isolateScope();
    }));

    describe('isolated scope', function () {

      it('should have .title', function () {
        expect(isolatedScope.title).toBe(scope.atitle);
      });

      it('should have .verbose', function () {
        expect(isolatedScope.verbose).toBe(scope.averbose);
      });

      it('should have .tiebreaker', function () {
        expect(isolatedScope.tiebreaker).toBe(scope.atiebreaker);
      });

      // TODO: Test elements

    });
  });
})();
