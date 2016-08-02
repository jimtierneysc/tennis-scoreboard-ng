(function () {
  'use strict';

  describe('feEmptyListMessage directive', function () {
    var compiledDirective;
    var scope;
    var isolatedScope;
    var element;
    var kind = 'players';

    beforeEach(module('frontendMatches'));

    beforeEach(inject(function ($compile, $rootScope) {

      scope = $rootScope.$new();
      scope.aloggedIn = true;

      var html = ('<fe-empty-list-message ' +
      'logged-in="aloggedIn" ' +
      'kind="' + kind + '"' +
      '></fe-empty-list-message>');

      element = angular.element(html);

      compiledDirective = $compile(element)(scope);
      scope.$digest();
      isolatedScope = compiledDirective.isolateScope();
    }));


    describe('isolated scope', function () {
      it('should have scope', function () {
        expect(isolatedScope).not.toBe(null);
      });

      it('should have .kind', function () {
        expect(isolatedScope.kind).toEqual(kind);
      });

      it('should have .loggedIn', function () {
        expect(isolatedScope.loggedIn).toBe(scope.aloggedIn);
      });

      // TODO: Test HTML elements

    });
  });
})();
