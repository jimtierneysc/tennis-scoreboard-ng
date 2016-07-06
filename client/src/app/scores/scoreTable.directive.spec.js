(function () {
  'use strict';

  describe('directive score commands', function () {
    var compiledDirective;
    var scope;
    var isolatedScope;
    var element;

    beforeEach(module('frontend'));
    beforeEach(inject(function ($compile, $rootScope) {

      var scores = {};

      scope = $rootScope.$new();
      scope.ascores = scores;
      scope.aloggedIn = true;

      var html = ('<fe-score-table ' +
      'scores="ascores" ' +
      'loggedin="aloggedIn" ' +
      '></fe-score-table>');

      element = angular.element(html);

      compiledDirective = $compile(element)(scope);
      scope.$digest();
      isolatedScope = compiledDirective.isolateScope();
    }));

    describe('isolated scope', function () {
      it('should not be null', function () {
        expect(isolatedScope).not.toBe(null);
      });

      describe('members', function () {
        it('should have scores', function () {
          expect(isolatedScope.scores).toBe(scope.ascores);
        });
        it('should have loggedin', function () {
          expect(isolatedScope.loggedin).toEqual(scope.aloggedIn);
        })
      });

      // TODO: Test elements

    });
  });
})();
