(function () {
  'use strict';

  describe('loadCredentials run', function () {
    var loadCredentials;

    beforeEach(module('app.run'));

    beforeEach(function () {
      loadCredentials = jasmine.createSpy('loadCredentials');
      module(function ($provide) {
        // Mock loadCredentials function
        $provide.service('userCredentials', function () {
          this.loadCredentials = loadCredentials;
        });
      });
      inject(); // run
    });

    it('should have called .loadCredentials()', function () {
      expect(loadCredentials).toHaveBeenCalled();
    });
  });
})();
