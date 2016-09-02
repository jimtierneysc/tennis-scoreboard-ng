(function () {
  'use strict';

  describe('fePlayerName directive', function () {
    var compiledDirective;
    var scope;
    var isolatedScope;
    var element;
    var $rootScope;
    var $compile;
    var player = {};

    beforeEach(module('app.players'));
    
    function createElement(shortPlayerName, period) {
      scope = $rootScope.$new();
      scope.aplayer = player;

      var html = ('<fe-player-name ' +
      'player="aplayer" ' +
      (period ? 'punctuation="." ' : '') +
      (shortPlayerName ? 'short-player-name="true" ' : '') +
      '></fe-player-name>');

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

      it('should have .playerName()', function () {
        expect(isolatedScope.vm.playerName).toEqual(jasmine.any(Function));
      });

      it('should have .suffix()', function () {
        expect(isolatedScope.vm.suffix).toEqual(jasmine.any(Function));
      });

    });

    var shortName = 'short name';
    var longName = 'long name';

    var tests = [
      {shortName: true, period: true, expected: [shortName + '.', shortName + '.', longName + '.', longName + '.']},
      {shortName: true, period: false, expected: [shortName, shortName + '.', longName, longName + '.']},
      {shortName: false, period: true, expected: [longName + '.', longName + '.', longName + '.', longName + '.']},
      {shortName: false, period: false, expected: [longName, longName, longName, longName + '.']}
    ];

    function updatePlayer(name, shortName) {
      player.name = name;
      player.shortName = shortName;
    }

    angular.forEach(tests, function (test, index) {
      var prefix = test.shortName ? 'short player name' : 'long player name';
      var suffix = (test.period ? 'with period' : 'without period') + ' (test ' + index + ')';

      describe(prefix + ' ' + suffix, function () {

        beforeEach(function () {
          createElement(test.shortName, test.period);
        });

        function expected(index) {
          expect(isolatedScope.vm.playerName() +
            isolatedScope.vm.suffix()).toEqual(test.expected[index]);
        }

        it('should support name and shortName', function () {
          updatePlayer(longName, shortName);
          expected(0);
        });

        it('should support name and shortName with period', function () {
          updatePlayer(longName, shortName + '.');
          expected(1);
        });

        it('should support name only', function () {
          updatePlayer(longName, undefined);
          expected(2);
        });

        it('should support name with period', function () {
          updatePlayer(longName + '.', undefined);
          expected(3);
        });
      });
    });
  });
})();
