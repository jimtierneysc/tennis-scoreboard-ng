(function () {
  'use strict';

  describe('feMatchState directive', function () {
    var compiledDirective;
    var scope;
    var isolatedScope;
    var element;

    beforeEach(module('app.matches'));

    beforeEach(inject(function ($compile, $rootScope) {

      scope = $rootScope.$new();
      scope.amatch = {};

      var html = ('<fe-match-state ' +
      'match="amatch" ' +
      '></fe-match-state>');

      element = angular.element(html);

      compiledDirective = $compile(element)(scope);
      scope.$digest();
      isolatedScope = compiledDirective.isolateScope();
    }));

    describe('isolated scope', function () {

      it('should have .match', function () {
        expect(isolatedScope.match).toBe(scope.amatch);
      });
      
    });
  });
})();
