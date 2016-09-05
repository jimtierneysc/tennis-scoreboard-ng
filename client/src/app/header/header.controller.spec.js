(function () {
  'use strict';

  describe('HeaderController', function () {
    var vm;
    var $scope;
    var $timeout;
    var $rootScope;
    var userCredentials;
    var $localStorage;
    var $httpBackend;
    var userResource;

    beforeEach(module('app.header'));

    beforeEach(function () {

      inject(function (_$controller_, _$rootScope_, _$timeout_, _userCredentials_,
      _$localStorage_, _$httpBackend_, _userResource_) {
        $rootScope = _$rootScope_;
        $localStorage = _$localStorage_;
        userResource = _userResource_;
        $scope = $rootScope.$new();
        $timeout = _$timeout_;
        $httpBackend = _$httpBackend_;
        userCredentials = _userCredentials_;
        vm = _$controller_('HeaderController', {
          $scope: $scope
        });
      });
    });

    it('should support toastr', function () {
      expect(vm).toSupportToastr();
    });

    it('should support auth', function () {
      expect(vm).toSupportAuth();
    });

    describe('members', function () {
      it('should have .isCollapsed', function () {
        expect(vm.isCollapsed).toEqual(jasmine.any(Boolean));
      });

      it('should have .createLoginForm()', function () {
        expect(vm.createLoginForm).toEqual(jasmine.any(Boolean));
      });

      it('should have .showingLogin()', function () {
        expect(vm.showingLogin).toEqual(jasmine.any(Function));
      });

      it('should have .showLogin()', function () {
        expect(vm.showLogin).toEqual(jasmine.any(Function));
      });

      it('should have .collapse()', function () {
        expect(vm.collapse).toEqual(jasmine.any(Function));
      });
    });

    it('should create login form initially', function () {
      expect(vm.createLoginForm).toEqual(true);
    });

    it('should collapse navbar initially', function () {
      expect(vm.isCollapsed).toEqual(true);
    });

    it('should create login form when showing', function () {
      vm.showLogin(false);
      vm.showingLogin(true);
      expect(vm.createLoginForm).toEqual(true);
    });

    it('should destroy login form when close', function () {
      vm.showLogin(false);
      expect(vm.createLoginForm).toEqual(false);
    });

    it('should set focus when login form is shown', function () {
      var setFocus = false;
      $scope.$on('fe-autoFocus', function () {
        setFocus = true;
      });
      vm.showLogin(true);
      $timeout.flush();
      expect(setFocus).toBeTruthy();
    });

    it('should collapse when resolve close edit in progress', function () {
      vm.isCollapsed = false;
      $rootScope.$emit('editing-in-progress:confirmed', {}, true);
      expect(vm.isCollapsed).toBeTruthy();
    });

    it('should collapse when reject close edit in progress', function () {
      vm.isCollapsed = false;
      $rootScope.$emit('editing-in-progress:confirmed', {}, false);
      expect(vm.isCollapsed).toBeTruthy();
    });

    describe('when login', function () {

      beforeEach(function () {
        userCredentials.setCredentials('user', 'token');
        vm.isCollapsed = true;
        userCredentials.clearCredentials();
      });

      it('should collapse', function () {
        expect(vm.isCollapsed).toBeTruthy();
      });

      it('should show toast', function () {
        expect(vm).toHaveToast();
      });
    });

    describe('when login', function () {

      beforeEach(function () {
        userCredentials.clearCredentials();
        vm.isCollapsed = true;
        userCredentials.setCredentials('user', 'token');
      });

      it('should collapse', function () {
        expect(vm.isCollapsed).toBeTruthy();
      });

      it('should show toast', function () {
        expect(vm).toHaveToast();
      });

    });


    var USERNAME = 'ausername';

    describe('when load credentials', function () {
      var data;
      beforeEach(function () {
        // Create credentials data
        userCredentials.setCredentials(USERNAME, 'atoken');
        data = $localStorage[userCredentials.localDataName];
        // Logout
        userCredentials.clearCredentials();
        // Set local data
        $localStorage[userCredentials.localDataName] = data;

        $httpBackend.expect('GET', userResource.path).respond(200,
          {
            username: USERNAME
          }
        );
        vm.clearToast();

        // Load credentials from local storage and validate
        // credentials by making an http request
        userCredentials.loadCredentials(true); // true means loading
        $httpBackend.flush();
      });

      it('should not show toast', function () {
        expect(vm).not.toHaveToast();
      });

      it('should be logged in', function () {
        // Validate test
        expect(vm.loggedIn).toBeTruthy();
      });
    });

  })
})();
