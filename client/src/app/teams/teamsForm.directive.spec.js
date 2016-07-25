(function () {
  'use strict';

  fdescribe('feTeamsForm directive', function () {
    var errors;
    var entity;
    var compiledDirective;
    var scope;
    var okText;
    var isolatedScope;
    var element;
    var players;

    beforeEach(module('frontend-teams'));

    beforeEach(inject(function ($compile, $rootScope) {

      errors = {
        other: ['othererror'],
        name: ['nameerror']
      };
      entity = {name: 'aname', doubles: true};
      players = [{name: 'aname', id: 1}];
      okText = 'clickme';

      scope = $rootScope.$new();
      scope.aform = null;
      scope.aentity = entity;
      scope.aerrors = errors; // errors;
      scope.asubmit = jasmine.createSpy('onSubmit');
      scope.acancel = jasmine.createSpy('onCancel');
      scope.aplayers = players;

      var html = ('<fe-teams-form ' +
      'form="aform" ' +
      'errors="aerrors" ' +
      'cancel="acancel()" ' +
      'submit="asubmit()" ' +
      'entity="aentity" ' +
      'players-list="aplayers" ' +
      'ok="' + okText + '"' +
      '></fe-teams-form>');

      element = angular.element(html);

      compiledDirective = $compile(element)(scope);
      scope.$digest();
      isolatedScope = compiledDirective.isolateScope();
    }));

    describe('isolated scope', function () {

      it('should have .form', function () {
        expect(isolatedScope.form).toEqual(scope.aform);
      });

      it('should have .errors', function () {
        expect(isolatedScope.errors).toBe(scope.aerrors);
      });

      it('should have .entity', function () {
        expect(isolatedScope.entity).toBe(scope.aentity);
      });

      it('should have .cancel()', function () {
        isolatedScope.cancel();
        expect(scope.acancel).toHaveBeenCalled();
      });

      it('should have .submit()', function () {
        isolatedScope.submit();
        expect(scope.asubmit).toHaveBeenCalled();
      });

      it('should have ok text', function () {
        expect(isolatedScope.ok).toEqual(okText);
      });

      it('should have .playersList', function () {
        expect(isolatedScope.playersList).toBe(players);
      });


      // TODO: Test form elements

    });
  });
})();
