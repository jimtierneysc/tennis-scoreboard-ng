(function () {
  'use strict';

  describe('feScoreTableSetResult directive', function () {
    var compiledDirective;
    var scope;
    var isolatedScope;
    var element;

    beforeEach(module('frontendScores'));

    beforeEach(inject(function ($compile, $rootScope) {

      scope = $rootScope.$new();
      scope.awinner = true;
      scope.acount = 5;
      scope.aset = {};
      scope.aview = {};

      var html = ('<fe-score-table-set-result ' +
      'winner="awinner" ' +
      'view="aview" ' +
      'set="aset" ' +
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

      it('should have .view', function () {
        expect(isolatedScope.view).toBe(scope.aview);
      });

      it('should have .set', function () {
        expect(isolatedScope.set).toBe(scope.aset);
      });

      // TODO: Test elements

    });
  });
})();
