(function () {
  'use strict';

  describe('feScoreStatus directive', function () {
    var compiledDirective;
    var scope;
    var isolatedScope;
    var element;

    beforeEach(module('frontendScores'));

    beforeEach(inject(function ($compile, $rootScope) {

      scope = $rootScope.$new();
      scope.ascores = {};

      var html = ('<fe-score-table-row-status ' +
      'scores="ascores" ' +
      'title="atitle" ' +
      '></fe-score-table-row-status>');

      element = angular.element(html);

      compiledDirective = $compile(element)(scope);
      scope.$digest();
      isolatedScope = compiledDirective.isolateScope();
    }));

    describe('isolated scope', function () {

      it('should have .scores', function () {
        expect(isolatedScope.scores).toBe(scope.ascores);
      });

      // TODO: Test elements

    });
  });
})();
