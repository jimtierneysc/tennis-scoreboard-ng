(function () {
  'use strict';

  describe('feMatchesForm directive', function () {
    var compiledDirective;
    var scope;
    var okText;
    var isolatedScope;
    var element;

    beforeEach(module('frontendMatches'));

    beforeEach(inject(function ($compile, $rootScope) {

      okText = 'clickme';

      scope = $rootScope.$new();
      scope.ateams = [];
      scope.aplayers = [];
      var vm = {
        form: null,
        entity: {},
        errors: {},
        submit: jasmine.createSpy('onSubmit'),
        cancel: jasmine.createSpy('onCancel'),
        ok: okText
      };
      scope.vm = vm;

      var html = ('<fe-matches-form ' +
      'vm="vm" ' +
      'players-list="aplayers" ' +
      'teams-list="ateams" ' +
      '></fe-matches-form>');

      element = angular.element(html);

      compiledDirective = $compile(element)(scope);
      scope.$digest();
      isolatedScope = compiledDirective.isolateScope();
    }));


    describe('isolated scope', function () {

      it('should have .vm', function () {
        expect(isolatedScope.vm).toBe(scope.vm);
      });

      it('should have .playersList', function () {
        expect(isolatedScope.playersList).toBe(scope.aplayers);
      });

      it('should have .teamsList', function () {
        expect(isolatedScope.teamsList).toBe(scope.ateams);
      });

    });
  });
})();
