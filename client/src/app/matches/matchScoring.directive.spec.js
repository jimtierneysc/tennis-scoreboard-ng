(function () {
  'use strict';

  describe('directive match scoring', function () {
    var compiledDirective;
    var scope;
    var isolatedScope;
    var element;

    beforeEach(module('frontend'));
    beforeEach(inject(function ($compile, $rootScope) {

      var match = {title: 'atitle', doubles: true};

      scope = $rootScope.$new();
      scope.amatch = match;

      var html = ('<fe-match-scoring ' +
      'match="amatch" ' +
      '></fe-match-scoring>');

      element = angular.element(html);

      compiledDirective = $compile(element)(scope);
      scope.$digest();
      isolatedScope = compiledDirective.isolateScope();
    }));


    describe('isolated scope', function () {
      it('has .scope', function () {
        expect(isolatedScope).not.toBe(null);
      });

      describe('members', function () {
        it('has .match', function () {
          expect(isolatedScope.match).toBe(scope.amatch);
        });
      });

      // TODO: Test HTML elements

    });
  });
})();
