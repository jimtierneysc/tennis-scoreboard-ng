(function () {
  'use strict';

  describe('feScoreTableGameResult directive', function () {
    var compiledDirective;
    var scope;
    var isolatedScope;
    var element;

    beforeEach(module('app.scores'));

    beforeEach(inject(function ($compile, $rootScope) {

      scope = $rootScope.$new();
      scope.aleftmost = true;
      scope.aview = {};
      scope.ascores = {};
      scope.agame = {};

      var html = ('<fe-score-table-game-result ' +
      'leftmost="aleftmost" ' +
      'game="agame" ' +
      'scores="ascores" ' +
      'view="aview" ' +
      '></fe-score-table-game-result>');

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

      it('should have .scores', function () {
        expect(isolatedScope.scores).toBe(scope.ascores);
      });

      it('should have .leftmost', function () {
        expect(isolatedScope.leftmost).toBe(scope.aleftmost);
      });

      // TODO: Test elements

    });
  });
})();
