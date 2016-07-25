(function () {
  'use strict';

  fdescribe('feScoreTable directive', function () {
    var compiledDirective;
    var scope;
    var isolatedScope;
    var element;

    beforeEach(module('frontend-scores'));

    beforeEach(inject(function ($compile, $rootScope) {

      var scores = {};
      var view = {};

      scope = $rootScope.$new();
      scope.ascores = scores;
      scope.aloggedIn = true;
      scope.aview = view;

      var html = ('<fe-score-table ' +
      'scores="ascores" ' +
      'loggedin="aloggedIn" ' +
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
      
        it('should have .loggedin', function () {
          expect(isolatedScope.loggedin).toEqual(scope.aloggedIn);
        });
      
        it('should have .view', function () {
          expect(isolatedScope.view).toBe(scope.aview);
        });

      // TODO: Test elements

    });
  });
})();
