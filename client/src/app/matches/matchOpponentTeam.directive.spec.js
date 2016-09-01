(function () {
  'use strict';

  describe('feMatchOpponentTeam directive', function () {
    var compiledDirective;
    var scope;
    var isolatedScope;
    var element;
    var team = {first_player: {}, second_player: {}};
    var $rootScope;
    var $compile;

    beforeEach(module('app.matches'));

     function createElement(period) {
      scope = $rootScope.$new();
      scope.ateam = team;

      var html = ('<fe-match-opponent-team ' +
      'team="ateam" ' +
      (period ? 'punctuation="." ' : '') +
      '></fe-match-opponent-team>');

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
        createElement(true);
      });

      it('should have .teamName()', function () {
        expect(isolatedScope.vm.teamName).toEqual(jasmine.any(Function));
      });

      it('should have .suffix()', function () {
        expect(isolatedScope.vm.suffix).toEqual(jasmine.any(Function));
      });
    });

    var teamName = 'team name';

    var tests = [
      {period: true, expected: [teamName + '.', teamName + '.' ]},
      {period: false, expected: [teamName, teamName + '.']}
    ];

    function updateTeam(name) {
      team.name = name;
    }
    
    angular.forEach(tests, function (test, index) {
      var title = (test.period ? 'with period' : 'without period') +  ' (test ' + index + ')';

      describe(title, function () {

        function expected(index) {
          expect(isolatedScope.vm.teamName() +
            isolatedScope.vm.suffix()).toEqual(test.expected[index]);
        }
        
        beforeEach(function () {
          createElement(test.period);
        });

        it('should support name without period', function () {
          updateTeam(teamName);
          expected(0);
        });

        it('should support name with period', function () {
          updateTeam(teamName + '.');
          expected(1);
        });
      });
    });
  });
})();
