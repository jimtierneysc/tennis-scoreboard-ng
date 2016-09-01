(function () {
  'use strict';

  describe('feTeamsForm directive', function () {
    var compiledDirective;
    var scope;
    var okText;
    var isolatedScope;
    var element;

    beforeEach(module('app.teams'));

    beforeEach(inject(function ($compile, $rootScope) {

      okText = 'clickme';

      scope = $rootScope.$new();
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

      var html = ('<fe-teams-form ' +
      'vm="vm" ' +
      'players-list="aplayers" ' +
      '></fe-teams-form>');

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


      // TODO: Test form elements

    });
  });
})();
