(function () {
  'use strict';

  describe('waitIndicator constants', function () {

    var waitInterval;

    beforeEach(module('frontendComponents'));

    beforeEach(inject(function (_waitInterval_) {
      waitInterval = _waitInterval_;
    }));

    it('should have .waitInterval', function () {
      expect(waitInterval).toEqual(1000);
    });

  });
})();

