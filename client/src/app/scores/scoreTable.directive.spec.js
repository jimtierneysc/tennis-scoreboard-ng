(function () {
  'use strict';

  describe('feScoreTable directive', function () {
    var compiledDirective;
    var scope;
    var isolatedScope;
    var element;

    beforeEach(module('frontendScores'));

    beforeEach(inject(function ($compile, $rootScope) {

      scope = $rootScope.$new();
      scope.ascores = {};
      scope.aloggedIn = true;
      scope.aupdating = true;
      scope.aview = {};

      var html = ('<fe-score-table ' +
      'scores="ascores" ' +
      'updating="aupdating" ' +
      'logged-in="aloggedIn" ' +
      'view="aview" ' +
      '></fe-score-table>');

      element = angular.element(html);

      compiledDirective = $compile(element)(scope);
      scope.$digest();
      isolatedScope = compiledDirective.isolateScope();
    }));

    describe('isolated scope', function () {

      it('should have .scores', function () {
        expect(isolatedScope.scores).toBe(scope.ascores);
      });

      it('should have .loggedIn', function () {
        expect(isolatedScope.loggedIn).toEqual(scope.aloggedIn);
      });

      it('should have .view', function () {
        expect(isolatedScope.view).toBe(scope.aview);
      });

      it('should have .updating', function () {
        expect(isolatedScope.updating).toBe(scope.aupdating);
      });

      // TODO: Test elements

    });
  });
})();
