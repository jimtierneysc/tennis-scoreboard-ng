(function () {
  'use strict';

  describe('fePlayerSelectList directive', function () {
    var compiledDirective;
    var scope;
    var isolatedScope;
    var element;
    var $rootScope;
    var $compile;
    var player = 'first_player';

    beforeEach(module('app.players'));
    
    function createElement(shortPlayerName, period) {
      scope = $rootScope.$new();
      scope.avm = {};
      scope.aplayersList = [];

      var html = ('<fe-player-select-list ' +
      'player="' + player + '" ' +
      'vm="avm" ' +
      'players-list="aplayersList" ' +

      '></fe-player-select-list>');

      element = angular.element(html);

      compiledDirective = $compile(element)(scope);
      scope.$digest();
      isolatedScope = compiledDirective.isolateScope();
    }

    beforeEach(inject(function (_$compile_, _$rootScope_) {

      $rootScope = _$rootScope_;
      $compile = _$compile_;
    }));

    describe('members', function () {
      beforeEach(function () {
        createElement(false, false);
      });

      it('should have .player', function () {
        expect(isolatedScope.player).toEqual(player);
      });

      it('should have .vm', function () {
        expect(isolatedScope.vm).toBe(scope.avm);
      });

      it('should have .playersList', function () {
        expect(isolatedScope.playersList).toBe(scope.aplayersList);
      });

    });
  });
})();
