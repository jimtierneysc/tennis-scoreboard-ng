(function () {
  'use strict';

  describe('waitInterval constants', function () {

    var waitInterval;

    beforeEach(module('app.components'));

    beforeEach(inject(function (_waitInterval_) {
      waitInterval = _waitInterval_;
    }));

    it('should have .waitInterval', function () {
      expect(waitInterval).toEqual(1000);
    });

  });
})();

