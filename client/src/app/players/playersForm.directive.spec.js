(function () {
  'use strict';

  describe('fePlayerForm directive', function () {
    var compiledDirective;
    var scope;
    var okText;
    var isolatedScope;
    var element;

    beforeEach(module('frontendPlayers'));

    beforeEach(inject(function ($compile, $rootScope) {

      okText = 'clickme';

      scope = $rootScope.$new();
      var vm = {
        form: null,
        entity: {},
        errors: {},
        submit: jasmine.createSpy('onSubmit'),
        cancel: jasmine.createSpy('onCancel'),
        ok: okText
      };
      scope.vm = vm;

      var html = ('<fe-players-form ' +
      'vm="vm" ' +
      '></fe-players-form>');

      element = angular.element(html);

      compiledDirective = $compile(element)(scope);
      scope.$digest();
      isolatedScope = compiledDirective.isolateScope();
    }));

    describe('isolated scope', function () {
      it('should have .vm', function () {
        expect(isolatedScope.vm).toBe(scope.vm);
      });

    });
  });
})();
