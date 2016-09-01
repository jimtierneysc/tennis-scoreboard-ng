(function () {
  'use strict';

  describe('feScoreTableOpponent directive', function () {
    var compiledDirective;
    var scope;
    var isolatedScope;
    var element;

    beforeEach(module('app.scores'));

    beforeEach(inject(function ($compile, $rootScope) {
      
      scope = $rootScope.$new();
      scope.ascores = {};
      scope.aopponent = {};
      scope.aview = {};

      var html = ('<fe-score-table-opponent ' +
      'scores="ascores" ' +
      'view="aview" ' +
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
        expect(isolatedScope.opponent).toBe(scope.aopponent);
      });

      it('should have .view', function () {
        expect(isolatedScope.view).toBe(scope.aview);
      });

      it('should have .leftmost', function () {
        expect(isolatedScope.leftmost).toBeTruthy();
      });

      // TODO: Test elements

    });
  });
})();
