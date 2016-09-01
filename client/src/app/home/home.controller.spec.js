(function () {
  'use strict';

  describe('HomeController', function () {
    var vm;

    beforeEach(module('app.home'));

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
