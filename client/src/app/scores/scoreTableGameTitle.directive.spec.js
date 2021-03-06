(function () {
  'use strict';

  describe('feScoreTableGameTitle directive', function () {
    var compiledDirective;
    var scope;
    var isolatedScope;
    var element;

    beforeEach(module('app.scores'));

    beforeEach(inject(function ($compile, $rootScope) {

      scope = $rootScope.$new();
      scope.agame = {};

      var html = ('<fe-score-table-game-title ' +
      'game="agame" ' +
      '></fe-score-table-game-title>');

      element = angular.element(html);

      compiledDirective = $compile(element)(scope);
      scope.$digest();
      isolatedScope = compiledDirective.isolateScope();
    }));

    describe('isolated scope', function () {

      it('should have .game', function () {
        expect(isolatedScope.game).toBe(scope.agame);
      });

      // TODO: Test elements

    });
  });
})();
