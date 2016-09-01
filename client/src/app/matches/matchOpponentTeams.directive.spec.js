(function () {
  'use strict';

  describe('feMatchOpponentTeams directive', function () {
    var compiledDirective;
    var scope;
    var isolatedScope;
    var element;

    beforeEach(module('app.matches'));

    beforeEach(inject(function ($compile, $rootScope) {

      scope = $rootScope.$new();
      scope.amatch = {
        first_team: {
          first_player: {},
          second_player: {}
        },
        second_team: {
          first_player: {},
          second_player: {}
        }
      };

      var html = ('<fe-match-opponent-teams ' +
      'match="amatch" ' +
      '></fe-match-opponent-teams>');

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
