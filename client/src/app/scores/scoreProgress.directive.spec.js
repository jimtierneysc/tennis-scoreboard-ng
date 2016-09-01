(function () {
  'use strict';

  describe('feScoreProgress directive', function () {
    var compiledDirective;
    var scope;
    var isolatedScope;
    var element;

    beforeEach(module('app.scores'));

    beforeEach(inject(function ($compile, $rootScope) {

      scope = $rootScope.$new();
      scope.ascores = {};
      scope.aview = {};

      var html = ('<fe-score-progress ' +
      'scores="ascores" ' +
      'view="aview" ' +
      '></fe-score-progress>');

      element = angular.element(html);

      compiledDirective = $compile(element)(scope);
      scope.$digest();
      isolatedScope = compiledDirective.isolateScope();
    }));

    describe('isolated scope', function () {

      it('should have .scores', function () {
        expect(isolatedScope.scores).toBe(scope.ascores);
      });

      it('should have .view', function () {
        expect(isolatedScope.view).toEqual(scope.aview);
      });

      // TODO: Test elements

    });
  });
})();
