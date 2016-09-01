(function () {
  'use strict';

  describe('feScoreTableSelectServer directive', function () {
    var compiledDirective;
    var scope;
    var isolatedScope;
    var element;

    beforeEach(module('app.scores'));

    beforeEach(inject(function ($compile, $rootScope) {

      scope = $rootScope.$new();
      scope.ascores = {};
      scope.aview = {};

      var html = ('<fe-score-table-select-server ' +
      'scores="ascores" ' +
      'view="aview" ' +
      '></fe-score-table-select-server>');

      element = angular.element(html);

      compiledDirective = $compile(element)(scope);
      scope.$digest();
      isolatedScope = compiledDirective.isolateScope();
    }));

    describe('isolated scope', function () {

      it('should have .scores', function () {
        expect(isolatedScope.scores).toBe(scope.ascores);
      });

      it('should have .view', function () {
        expect(isolatedScope.view).toBe(scope.aview);
      });

      // TODO: Test elements

    });
  });
})();
