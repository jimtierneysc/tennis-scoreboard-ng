(function () {
  'use strict';

  describe('feScoreTableSetResult directive', function () {
    var compiledDirective;
    var scope;
    var isolatedScope;
    var element;

    beforeEach(module('app.scores'));

    beforeEach(inject(function ($compile, $rootScope) {

      scope = $rootScope.$new();
      scope.aleftmost = true;
      scope.ascores = 5;
      scope.aset = {};
      scope.aview = {};

      var html = ('<fe-score-table-set-result ' +
      'scores="ascores" ' +
      'view="aview" ' +
      'set="aset" ' +
      'leftmost="aleftmost" ' +
      '></fe-score-table-set-result>');

      element = angular.element(html);

      compiledDirective = $compile(element)(scope);
      scope.$digest();
      isolatedScope = compiledDirective.isolateScope();
    }));

    describe('isolated scope', function () {

      it('should have .scores', function () {
        expect(isolatedScope.scores).toBe(scope.ascores);
      });

      it('should have .leftmost', function () {
        expect(isolatedScope.leftmost).toBe(scope.aleftmost);
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
