(function () {
  'use strict';

  describe('feScoreButton directive', function () {
    var compiledDirective;
    var scope;
    var isolatedScope;
    var element;

    beforeEach(module('app.scores'));
    beforeEach(module(function ($provide) {
      $provide.factory('validateCredentials', function () {
        return function() { return false };
      });
    }));
    beforeEach(inject(function ($compile, $rootScope) {

      var scores = {};

      scope = $rootScope.$new();
      scope.ascores = scores;
      scope.aparam = 'foo';
      scope.aview = {};

      var html = ('<fe-score-button ' +
      'scores="ascores" ' +
      'param="aparam" ' +
      'view="aview" ' +
      '></fe-score-button>');

      element = angular.element(html);

      compiledDirective = $compile(element)(scope);
      scope.$digest();
      isolatedScope = compiledDirective.isolateScope();
    }));

    describe('isolated scope', function () {

      it('should have .scores', function () {
        expect(isolatedScope.scores).toBe(scope.ascores);
      });

      it('should have .param', function () {
        expect(isolatedScope.param).toBe(scope.aparam);
      });

      it('should have .view', function () {
        expect(isolatedScope.view).toBe(scope.aview);
      });

      // TODO: Test elements

    });
  });
})();
