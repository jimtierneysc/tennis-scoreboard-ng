(function () {
  'use strict';

  describe('feScoreTableSetTitle directive', function () {
    var compiledDirective;
    var scope;
    var isolatedScope;
    var element;

    beforeEach(module('frontendScores'));

    beforeEach(inject(function ($compile, $rootScope) {

      scope = $rootScope.$new();
      scope.aset = {};
      scope.aview = {};

      var html = ('<fe-score-table-set-title ' +
      'set="aset" ' +
      'view="aview" ' +
      '></fe-score-table-set-title>');

      element = angular.element(html);

      compiledDirective = $compile(element)(scope);
      scope.$digest();
      isolatedScope = compiledDirective.isolateScope();
    }));

    describe('isolated scope', function () {

      it('should have .set', function () {
        expect(isolatedScope.set).toBe(scope.aset);
      });

      it('should have .view', function () {
        expect(isolatedScope.view).toBe(scope.aview);
      });

      // TODO: Test elements

    });
  });
})();
