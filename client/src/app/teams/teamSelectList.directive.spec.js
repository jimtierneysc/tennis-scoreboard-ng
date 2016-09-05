(function () {
  'use strict';

  describe('feTeamSelectList directive', function () {
    var compiledDirective;
    var scope;
    var isolatedScope;
    var element;
    var $rootScope;
    var $compile;
    var team = 'first_team';

    beforeEach(module('app.teams'));


    function createElement() {
      scope = $rootScope.$new();
      scope.avm = {};
      scope.ateamsList = [];

      var html = ('<fe-team-select-list ' +
      'team="' + team + '" ' +
      'vm="avm" ' +
      'teams-list="ateamsList" ' +

      '></fe-team-select-list>');

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

      it('should have .team', function () {
        expect(isolatedScope.team).toEqual(team);
      });

      it('should have .vm', function () {
        expect(isolatedScope.vm).toBe(scope.avm);
      });

      it('should have .teamsList', function () {
        expect(isolatedScope.teamsList).toBe(scope.ateamsList);
      });

    });
  });
})();
