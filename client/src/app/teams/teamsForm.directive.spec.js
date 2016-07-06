(function () {
  'use strict';


  describe('directive teams form', function () {
    var errors;
    var entity;
    var compiledDirective;
    var scope;
    var okText;
    var isolatedScope;
    var element;
    var players;

    beforeEach(module('frontend'));
    beforeEach(inject(function ($compile, $rootScope) {

      errors = {
        other: ['othererror'],
        name: ['nameerror']
      };
      entity = {name: 'aname', doubles: true};
      players = [{name: 'aname',  id: 1}];
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
      'playerslist="aplayers" ' +
      'ok="' + okText + '"' +
      '></fe-teams-form>');

      element = angular.element(html);

      compiledDirective = $compile(element)(scope);
      scope.$digest();
      isolatedScope = compiledDirective.isolateScope();
    }));


    describe('isolated scope', function () {
      it('should not be null', function () {
        expect(isolatedScope).not.toBe(null);
      });

      describe('members', function () {
        it('should have form', function () {
          expect(isolatedScope.form).toEqual("aform");
        });

        it('should have errors', function () {
          expect(isolatedScope.errors).toBe(scope.aerrors);
        });

        it('should have entity', function () {
          expect(isolatedScope.entity).toBe(scope.aentity);
        });

        it('should have cancel', function () {
          isolatedScope.cancel();
          expect(scope.acancel).toHaveBeenCalled();
        });

        it('should have submit', function () {
          isolatedScope.submit();
          expect(scope.asubmit).toHaveBeenCalled();
        });

        it('should have ok', function () {
          expect(isolatedScope.ok).toEqual(okText);
        });

        it('should have players', function () {
          expect(isolatedScope.playerslist).toBe(players);
        });
      })


      // TODO: Test form elements

    });
  });
})();
