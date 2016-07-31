(function () {
  'use strict';

  describe('feScoreTableGameResult directive', function () {
    var compiledDirective;
    var scope;
    var isolatedScope;
    var element;

    beforeEach(module('frontendScores'));

    beforeEach(inject(function ($compile, $rootScope) {

      scope = $rootScope.$new();
      scope.awinner = true;
      scope.aleftmost = true;
      scope.aserviceBreak = true;

      var html = ('<fe-score-table-game-result ' +
      'winner="awinner" ' +
      'leftmost="aleftmost" ' +
      'service-break="aserviceBreak" ' +
      '></fe-score-table-game-result>');

      element = angular.element(html);

      compiledDirective = $compile(element)(scope);
      scope.$digest();
      isolatedScope = compiledDirective.isolateScope();
    }));

    describe('isolated scope', function () {

      it('should have .winner', function () {
        expect(isolatedScope.winner).toBe(scope.awinner);
      });

      it('should have .serviceBreak', function () {
        expect(isolatedScope.serviceBreak).toBe(scope.aserviceBreak);
      });

      it('should have .leftmost', function () {
        expect(isolatedScope.leftmost).toBe(scope.aleftmost);
      });

      // TODO: Test elements

    });
  });
})();
