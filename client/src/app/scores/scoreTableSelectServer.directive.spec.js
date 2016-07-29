(function () {
  'use strict';

  describe('feScoreTableSelectServer directive', function () {
    var compiledDirective;
    var scope;
    var isolatedScope;
    var element;

    beforeEach(module('frontendScores'));

    beforeEach(inject(function ($compile, $rootScope) {

      var game = {
      };

      scope = $rootScope.$new();
      scope.ascores = {};
      scope.aserver = 1;

      var html = ('<fe-score-table-select-server ' +
      'scores="ascores" ' +
      'server="aserver" ' +
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

      it('should have .server', function () {
        expect(isolatedScope.server).toBe(scope.aserver);
      });

      // TODO: Test elements

    });
  });
})();
