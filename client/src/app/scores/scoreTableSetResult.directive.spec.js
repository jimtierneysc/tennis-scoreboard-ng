(function () {
  'use strict';

  describe('feScoreTableSetResult directive', function () {
    var compiledDirective;
    var scope;
    var isolatedScope;
    var element;

    beforeEach(module('frontendScores'));

    beforeEach(inject(function ($compile, $rootScope) {

      var game = {
      };

      scope = $rootScope.$new();
      scope.awinner = true;
      scope.acount = 5;

      var html = ('<fe-score-table-set-result ' +
      'winner="awinner" ' +
      'count="acount" ' +
      '></fe-score-table-set-result>');

      element = angular.element(html);

      compiledDirective = $compile(element)(scope);
      scope.$digest();
      isolatedScope = compiledDirective.isolateScope();
    }));

    describe('isolated scope', function () {

      it('should have .winner', function () {
        expect(isolatedScope.winner).toBe(scope.awinner);
      });

      it('should have .count', function () {
        expect(isolatedScope.count).toBe(scope.acount);
      });

      // TODO: Test elements

    });
  });
})();
