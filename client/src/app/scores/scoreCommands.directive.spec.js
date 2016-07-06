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
      var view = {};

      scope = $rootScope.$new();
      scope.ascores = scores;
      scope.aloggedIn = true;
      scope.aview = view;

      var html = ('<fe-score-commands ' +
      'scores="ascores" ' +
      'view="aview" ' +
      'loggedin="aloggedIn" ' +
      '></fe-score-commands>');

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
        it('should have scores', function () {
          expect(isolatedScope.scores).toBe(scope.ascores);
        })
        it('should have view', function () {
          expect(isolatedScope.view).toBe(scope.aview);
        })
      });

      // TODO: Test elements

    });
  });
})();
