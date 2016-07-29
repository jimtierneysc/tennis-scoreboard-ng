(function () {
  'use strict';

  describe('feScoreTableOpponent directive', function () {
    var compiledDirective;
    var scope;
    var isolatedScope;
    var element;

    beforeEach(module('frontendScores'));

    beforeEach(inject(function ($compile, $rootScope) {

      var scores = {
        title: 'atitle', doubles: true,
        first_team: {title: 'xyz'}
      };

      scope = $rootScope.$new();
      scope.ascores = scores;
      scope.aopponent = scores.first_team;

      var html = ('<fe-score-table-opponent ' +
      'scores="ascores" ' +
      'opponent="aopponent" ' +
      'leftmost="true" ' +
      '></fe-score-table-opponent>');

      element = angular.element(html);

      compiledDirective = $compile(element)(scope);
      scope.$digest();
      isolatedScope = compiledDirective.isolateScope();
    }));

    describe('isolated scope', function () {

      it('should have .scores', function () {
        expect(isolatedScope.scores).toBe(scope.ascores);
      });

      it('should have .opponent', function () {
        expect(isolatedScope.opponent).toEqual(scope.ascores.first_team);
      });

      it('should have .leftmost', function () {
        expect(isolatedScope.leftmost).toBeTruthy();
      });

      // TODO: Test elements

    });
  });
})();
