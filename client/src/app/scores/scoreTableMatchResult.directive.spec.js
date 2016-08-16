(function () {
  'use strict';

  describe('feScoreTableMatchResult directive', function () {
    var compiledDirective;
    var scope;
    var isolatedScope;
    var element;

    beforeEach(module('frontendScores'));

    beforeEach(inject(function ($compile, $rootScope) {

      scope = $rootScope.$new();
      scope.aleftmost = true;
      scope.ascores = {};
      scope.aview = {};

      var html = ('<fe-score-table-match-result ' +
      'leftmost="aleftmost" ' +
      'scores="ascores" ' +
      'view="aview" ' +
      '></fe-score-table-match-result>');

      element = angular.element(html);

      compiledDirective = $compile(element)(scope);
      scope.$digest();
      isolatedScope = compiledDirective.isolateScope();
    }));

    describe('isolated scope', function () {

      it('should have .leftmost', function () {
        expect(isolatedScope.leftmost).toBe(scope.aleftmost);
      });

      it('should have .view', function () {
        expect(isolatedScope.view).toBe(scope.aview);
      });

      it('should have .scores', function () {
        expect(isolatedScope.scores).toBe(scope.ascores);
      });

      // TODO: Test elements

    });
  });
})();
