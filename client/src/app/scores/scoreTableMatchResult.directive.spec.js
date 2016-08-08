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
      scope.awinner = true;
      scope.acount = 5;
      scope.ascores = {};
      scope.aview = {};

      var html = ('<fe-score-table-match-result ' +
      'winner="awinner" ' +
      'count="acount" ' +
      'scores="ascores" ' +
      'view="aview" ' +
      '></fe-score-table-match-result>');

      element = angular.element(html);

      compiledDirective = $compile(element)(scope);
      scope.$digest();
      isolatedScope = compiledDirective.isolateScope();
    }));

    describe('isolated scope', function () {

      it('should have .winner', function () {
        expect(isolatedScope.winner).toBe(scope.awinner);
      });

      it('should have .view', function () {
        expect(isolatedScope.view).toBe(scope.aview);
      });

      it('should have .scores', function () {
        expect(isolatedScope.scores).toBe(scope.ascores);
      });

      it('should have .count', function () {
        expect(isolatedScope.count).toBe(scope.acount);
      });

      // TODO: Test elements

    });
  });
})();
