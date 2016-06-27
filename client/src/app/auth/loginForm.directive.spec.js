(function () {
  'use strict';

  /**
   * @todo Complete the test
   */
  describe('loginForm directive', function () {
    var $log;
    var compiledDirective;
    var scope;

    beforeEach(module('frontend'));
    beforeEach(inject(function ($compile, $rootScope, _$log_) {
      $log = _$log_;

      // TODO test directive
      var html = ('<fe-login-form> ' +
      '</fe-login-form>');

      var el = angular.element(html);

      scope = $rootScope.$new();
      compiledDirective = $compile(el)(scope);
      scope.$digest();
    }));

    it('should have isolate scope object with members', function () {
      var isolatedScope = compiledDirective.isolateScope();

      expect(isolatedScope).not.toEqual(null);
      // TODO: Get this working
      // expect(isolatedScope.entity).toBeDefined();
      // expect(isolatedScope.entity.name).toBeDefined();

    });
  });
})();
