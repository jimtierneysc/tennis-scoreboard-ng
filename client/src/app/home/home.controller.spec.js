(function () {
  'use strict';

  fdescribe('HomeController', function () {
    var vm;
    var $scope;
    var $timeout;
    var $rootScope;

    beforeEach(module('frontend-home'));

    beforeEach(function () {

      inject(function (_$controller_) {
        vm = _$controller_('HomeController');
      });
    });

    it('should have controller', function () {
      expect(vm).not.toBeNull();
    });

  })
})();
