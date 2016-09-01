(function () {
  'use strict';

  describe('feScoreTableSetTitle directive', function () {
    var compiledDirective;
    var scope;
    var isolatedScope;
    var element;

    beforeEach(module('app.scores'));

    beforeEach(inject(function ($compile, $rootScope) {

      scope = $rootScope.$new();
      scope.aset = {};

      var html = ('<fe-score-table-set-title ' +
      'set="aset" ' +
      '></fe-score-table-set-title>');

      element = angular.element(html);

      compiledDirective = $compile(element)(scope);
      scope.$digest();
      isolatedScope = compiledDirective.isolateScope();
    }));

    describe('isolated scope', function () {

      it('should have .set', function () {
        expect(isolatedScope.set).toBe(scope.aset);
      });

      // TODO: Test elements

    });
  });
})();
