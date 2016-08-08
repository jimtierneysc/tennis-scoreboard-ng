(function () {
  'use strict';

  describe('feMatchOpponentTeam directive', function () {
    var compiledDirective;
    var scope;
    var isolatedScope;
    var element;

    beforeEach(module('frontendMatches'));

    beforeEach(inject(function ($compile, $rootScope) {

      scope = $rootScope.$new();
      scope.ateam = {};

      var html = ('<fe-match_opponent-team ' +
      'team="ateam" ' +
      '></fe-match_opponent-team>');

      element = angular.element(html);

      compiledDirective = $compile(element)(scope);
      scope.$digest();
      isolatedScope = compiledDirective.isolateScope();
    }));

    describe('isolated scope', function () {

      it('should have .team', function () {
        expect(isolatedScope.team).toBe(scope.ateam);
      });

      // TODO: Test HTML elements

    });
  });
})();
