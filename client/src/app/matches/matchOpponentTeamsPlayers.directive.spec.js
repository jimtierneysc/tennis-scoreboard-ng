(function () {
  'use strict';

  describe('feMatchOpponentTeamsPlayers directive', function () {
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

      var html = ('<fe-match-opponent-teams-players ' +
      'match="amatch" ' +
      'short-player-names="true" ' +
      '></fe-match-opponent-teams-players>');

      element = angular.element(html);

      compiledDirective = $compile(element)(scope);
      scope.$digest();
      isolatedScope = compiledDirective.isolateScope();
    }));

    describe('members', function () {

      it('should have .match', function () {
        expect(isolatedScope.match).toBe(scope.amatch);
      });

      it('should have .shortPlayerNames', function () {
        expect(isolatedScope.shortPlayerNames).toBeTruthy();
      });
    });
  });
})();
