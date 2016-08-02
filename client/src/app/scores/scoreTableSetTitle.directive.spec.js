(function () {
  'use strict';

  describe('feScoreTableSetTitle directive', function () {
    var compiledDirective;
    var scope;
    var isolatedScope;
    var element;

    beforeEach(module('frontendScores'));

    beforeEach(inject(function ($compile, $rootScope) {

      var game = {
      };

      scope = $rootScope.$new();
      scope.atitle = game;

      var html = ('<fe-score-table-set-title ' +
      'title="atitle" ' +
      '></fe-score-table-set-title>');

      element = angular.element(html);

      compiledDirective = $compile(element)(scope);
      scope.$digest();
      isolatedScope = compiledDirective.isolateScope();
    }));

    describe('isolated scope', function () {

      it('should have .title', function () {
        expect(isolatedScope.title).toBe(scope.atitle);
      });

      // TODO: Test elements

    });
  });
})();
