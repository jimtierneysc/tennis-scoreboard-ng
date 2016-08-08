(function () {
  'use strict';

  describe('feScoreTableGameTitle directive', function () {
    var compiledDirective;
    var scope;
    var isolatedScope;
    var element;

    beforeEach(module('frontendScores'));

    beforeEach(inject(function ($compile, $rootScope) {

      var game = {
      };

      scope = $rootScope.$new();
      scope.aview = {};
      scope.agame = {};

      var html = ('<fe-score-table-game-title ' +
      'game="agame" ' +
      'view="aview" ' +
      '></fe-score-table-game-title>');

      element = angular.element(html);

      compiledDirective = $compile(element)(scope);
      scope.$digest();
      isolatedScope = compiledDirective.isolateScope();
    }));

    describe('isolated scope', function () {

      it('should have .view', function () {
        expect(isolatedScope.view).toBe(scope.aview);
      });

      it('should have .game', function () {
        expect(isolatedScope.game).toBe(scope.agame);
      });

      // TODO: Test elements

    });
  });
})();
