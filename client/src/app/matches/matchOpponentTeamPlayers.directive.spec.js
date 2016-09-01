(function () {
  'use strict';

  describe('feMatchOpponentTeamPlayers directive', function () {
    var compiledDirective;
    var scope;
    var isolatedScope;
    var element;

    beforeEach(module('app.matches'));
    
    beforeEach(inject(function ($compile, $rootScope) {
      scope = $rootScope.$new();
      scope.ateam = {
        first_player: {},
        second_player: {}
      };

      var html = ('<fe-match-opponent-team-players ' +
      'team="ateam" ' +
      'short-player-names="true" ' +
      'punctuation="." ' +
      '></fe-match-opponent-team-players>');

      element = angular.element(html);

      compiledDirective = $compile(element)(scope);
      scope.$digest();
      isolatedScope = compiledDirective.isolateScope();
    }));

    describe('members', function () {

      it('should have .team', function () {
        expect(isolatedScope.team).toBe(scope.ateam);
      });

      it('should have .shortPlayerNames', function () {
        expect(isolatedScope.shortPlayerNames).toBeTruthy();
      });

      it('should have .punctuation', function () {
        expect(isolatedScope.punctuation).toEqual('.');
      });
    });
  });
})();
