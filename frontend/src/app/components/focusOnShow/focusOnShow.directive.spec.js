(function() {
  'use strict';

  describe('directive focusOnShow', function() {
    var $rootScope;
    var $compile;

    beforeEach(module('frontend'));
    beforeEach(inject(function(_$compile_, _$rootScope_) {
      $rootScope = _$rootScope_;
      $compile = _$compile_;
      $rootScope.boolValue = false;
      $rootScope.settingFocus = false;
     }));

    it('should set focus when toggle ng-show', function() {
      // Compile a piece of HTML containing the directive
      var element = $compile('<input type="text" ng-show="boolValue" fe-focus-on-show name="input">')($rootScope);
      expect(element).toEqual(jasmine.any(Object));
      // fire all the watches, so the scope expression will be evaluated
      $rootScope.$digest();
      $rootScope.boolValue = true;
      expect($rootScope.settingFocus).toEqual(false);
      $rootScope.$digest();
      expect($rootScope.settingFocus).toEqual(true);
    });

    it('should set focus toggle ng-hide', function() {
      // Compile a piece of HTML containing the directive
      var element = $compile('<input type="text" ng-hide="!boolValue" fe-focus-on-show name="input">')($rootScope);
      expect(element).toEqual(jasmine.any(Object));
      // fire all the watches, so the scope expression will be evaluated
      $rootScope.$digest();
      $rootScope.boolValue = true;
      expect($rootScope.settingFocus).toEqual(false);
      $rootScope.$digest();
      expect($rootScope.settingFocus).toEqual(true);
    });

  });
})();
