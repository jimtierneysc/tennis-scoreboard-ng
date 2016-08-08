(function () {
  'use strict';

  describe('feScoreProgressWinner directive', function () {
    var compiledDirective;
    var scope;
    var isolatedScope;
    var element;

    beforeEach(module('frontendScores'));

    beforeEach(inject(function ($compile, $rootScope) {

      scope = $rootScope.$new();
      scope.ascores = {winner: 1};

      var html = ('<fe-score-progress-winner ' +
      'scores="ascores" ' +
      'winner="ascores.winner" ' +
      '></fe-score-progress-winner>');

      element = angular.element(html);

      compiledDirective = $compile(element)(scope);
      scope.$digest();
      isolatedScope = compiledDirective.isolateScope();
    }));


    describe('isolated scope', function () {

      it('should have .scores', function () {
        expect(isolatedScope.scores).toBe(scope.ascores);
      });

      it('should have .winner', function () {
        expect(isolatedScope.winner).toBe(scope.ascores.winner);
      });

      // TODO: Test HTML elements

    });
  });
})();
