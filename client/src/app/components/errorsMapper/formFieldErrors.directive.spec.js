(function () {
  'use strict';

  describe('feFormFieldErrors directive', function () {
    var compiledDirective;
    var scope;
    var isolatedScope;
    var element;
    var key = 'somekey';
    var prefix = 'someprefix';

    beforeEach(module('frontendComponents'));

    beforeEach(inject(function ($compile, $rootScope) {

      scope = $rootScope.$new();
      scope.aerrors = {};

      var html = ('<fe-form-field-errors ' +
      'errors="aerrors" ' +
      'key="' + key + '"' +
      'prefix="' + prefix + '"' +
      '></fe-form-field-errors>');

      element = angular.element(html);

      compiledDirective = $compile(element)(scope);
      scope.$digest();
      isolatedScope = compiledDirective.isolateScope();
    }));

    describe('isolated scope', function () {

      it('should have .errors', function () {
        expect(isolatedScope.errors).toBe(scope.aerrors);
      });

      it('should have .key', function () {
        expect(isolatedScope.key).toEqual(key);
      });

      it('should have .prefix', function () {
        expect(isolatedScope.prefix).toEqual(prefix);
      });

    });
  });
})();
