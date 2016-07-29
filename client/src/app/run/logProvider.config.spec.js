(function () {
  'use strict';

  describe('logProvider config', function () {

    var $logProvider;

    beforeEach(module('frontendRun'));

    beforeEach(function () {
      module(function ($provide, _$logProvider_) {
        $logProvider = _$logProvider_;
        // Mock loadCredentials function to prevent http request
        $provide.service('userCredentials', function () {
          this.loadCredentials = jasmine.createSpy('loadCredentials');
        });
      });
      inject(); // run
    });

    it('should have enabled debug', function () {
      expect($logProvider.debugEnabled).toBeTruthy();
    });
  });
})();
