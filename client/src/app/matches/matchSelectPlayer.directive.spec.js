(function () {
  'use strict';

  describe('feMatchSelectPlayer directive', function () {
    var compiledDirective;
    var scope;
    var isolatedScope;
    var element;
    var $rootScope;
    var $compile;
    var player = 'first_player';

    beforeEach(module('app.matches'));


    function createElement() {
      scope = $rootScope.$new();
      scope.aplayer = player;

      var html = ('<fe-match-select-player ' +
      'vm="avm" ' +
      'player-list="aplayerList"' +
      'player="' + player + '" ' +
      '></fe-match-select-player>');

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
        createElement();
      });

      it('should have .player()', function () {
        expect(isolatedScope.player).toEqual(player);
      });

      it('should have .vm', function () {
        expect(isolatedScope.vm).toBe(scope.avm);
      });

      it('should have .playerList', function () {
        expect(isolatedScope.vm).toBe(scope.aplayerList);
    });

    });


  });
})();
