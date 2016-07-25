(function () {
  'use strict';

  fdescribe('feScoreStatus directive', function () {
    var compiledDirective;
    var scope;
    var isolatedScope;
    var element;

    beforeEach(module('frontend-scores'));

    beforeEach(inject(function ($compile, $rootScope) {

      var scores = {title: 'atitle', doubles: true};
      var title = 'sometitle'

      scope = $rootScope.$new();
      scope.ascores = scores;
      scope.atitle = title;

      var html = ('<fe-score-status ' +
      'scores="ascores" ' +
      'title="atitle" ' +
      '></fe-score-status>');

      element = angular.element(html);

      compiledDirective = $compile(element)(scope);
      scope.$digest();
      isolatedScope = compiledDirective.isolateScope();
    }));

    describe('isolated scope', function () {

      it('should have .scores', function () {
        expect(isolatedScope.scores).toBe(scope.ascores);
      });

      it('should have .title', function () {
        expect(isolatedScope.title).toEqual(scope.atitle);
      });

      // TODO: Test elements

    });
  });
})();
