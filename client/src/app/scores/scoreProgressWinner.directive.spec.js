(function () {
  'use strict';

  describe('feScoreProgressWinner directive', function () {
    var compiledDirective;
    var scope;
    var isolatedScope;
    var element;

    beforeEach(module('app.scores'));

    beforeEach(inject(function ($compile, $rootScope) {

      scope = $rootScope.$new();
      scope.ascores = {winner: 1};

      var html = ('<fe-score-progress-winner ' +
      'scores="ascores" ' +
      'winner="ascores.winner" ' +
      'match-winner="true" ' +
      'punctuation="." ' +
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

      it('should have .matchWinner', function () {
        expect(isolatedScope.matchWinner).toBeTruthy();
      });

      it('should have .punctuation', function () {
        expect(isolatedScope.punctuation).toEqual('.');
      });

    });
  });
})();
