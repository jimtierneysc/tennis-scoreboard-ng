(function () {
  'use strict';

  fdescribe('fePlayerForm directive', function () {
    var compiledDirective;
    var scope;
    var okText;
    var isolatedScope;
    var element;

    beforeEach(module('frontend-players'));

    beforeEach(inject(function ($compile, $rootScope) {

      var errors = {
        other: ['othererror'],
        name: ['nameerror']
      };
      var entity = {name: 'aname'};
      okText = 'clickme';

      scope = $rootScope.$new();
      scope.aform = null;
      scope.aentity = entity;
      scope.aerrors = errors; // errors;
      scope.asubmit = jasmine.createSpy('onSubmit');
      scope.acancel = jasmine.createSpy('onCancel');

      var html = ('<fe-players-form ' +
      'form="aform" ' +
      'errors="aerrors" ' +
      'cancel="acancel()" ' +
      'submit="asubmit()" ' +
      'entity="aentity" ' +
      'ok="' + okText + '"' +
      '></fe-players-form>');

      element = angular.element(html);

      compiledDirective = $compile(element)(scope);
      scope.$digest();
      isolatedScope = compiledDirective.isolateScope();
    }));


    describe('isolated scope', function () {
      it('should have scope', function () {
        expect(isolatedScope).not.toBe(null);
      });

      describe('members', function () {
        it('should have .form', function () {
          expect(isolatedScope.form).toEqual(scope.aform);
        });

        it('should have .errors', function () {
          expect(isolatedScope.errors).toBe(scope.aerrors);
        });

        it('should have .entity', function () {
          expect(isolatedScope.entity).toBe(scope.aentity);
        });

        it('should call .cancel()', function () {
          isolatedScope.cancel();
          expect(scope.acancel).toHaveBeenCalled();
        });

        it('should call .submit()', function () {
          isolatedScope.submit();
          expect(scope.asubmit).toHaveBeenCalled();
        });

        it('should have ok text', function () {
          expect(isolatedScope.ok).toEqual(okText);
        });
      });

      // TODO: Test HTML elements

    });
  });
})();
