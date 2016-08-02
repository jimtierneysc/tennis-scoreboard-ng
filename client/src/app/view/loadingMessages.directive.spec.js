(function () {
  'use strict';

  describe('feLoadingMessages directive', function () {
    var compiledDirective;
    var scope;
    var isolatedScope;
    var element;

    beforeEach(module('frontendView'));

    beforeEach(inject(function ($compile, $rootScope) {

      scope = $rootScope.$new();
      scope.aerror = {statusText: 'abc'};
      scope.aloading = true;
      scope.aloadingFailed = true;

      var html = ('<fe-loading-messages ' +
      'error="aerror" ' +
      'loading="aloading" ' +
      'failed="aloadingFailed" ' +
      '></fe-loading-messages>');

      element = angular.element(html);

      compiledDirective = $compile(element)(scope);
      scope.$digest();
      isolatedScope = compiledDirective.isolateScope();
    }));

    describe('isolated scope', function () {

      it('should have .loading', function () {
        expect(isolatedScope.loading).toEqual(scope.aloading);
      });

      it('should have .error', function () {
        expect(isolatedScope.error).toEqual(scope.aerror);
      });

      it('should have .loadingFailed', function () {
        expect(isolatedScope.failed).toEqual(scope.aloadingFailed);
      });



      // TODO: Test form elements

    });
  });
})();
