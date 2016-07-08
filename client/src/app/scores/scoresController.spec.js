(function () {
  'use strict';

  describe('controller scores', function () {
    var $controller;
    var $scope;
    var $state;

    var sampleResponse = [
      {
        id: 1,
        name: "xyz"
      }
    ];

    beforeEach(module('frontend'));
    beforeEach(inject(function (_$controller_, $rootScope) {
      $controller = _$controller_;
      $scope = $rootScope.$new();
      $state = new MockState();
    }));


    function scoreController(response) {
      var locals = {
        $scope: $scope,
        $state: $state,
        response: response
      };
      var vm = $controller('ScoresController', locals);

      return vm;
    }


    describe('supports', function () {
      var vm;

      beforeEach(function () {
        vm = scoreController(sampleResponse);
      });

      it('should support auth', function () {
        expect(vm.supportsAuth).toBeTruthy();
      });

      it('should supports loading', function () {
        expect(vm.supportsLoading).toBeTruthy();
      });

    });

    describe('loading', function () {

      it('should load', function () {
        var vm = scoreController(sampleResponse);
        expect(vm.loadingFailed).toBeFalsy();
      });

      it('should fail', function () {
        var vm = scoreController({error: 'something'});
        expect(vm.loadingFailed).toBeTruthy();
      });

      describe('select match', function () {
        var valid = sampleResponse[0];
        var invalid = {id: 9999};
        beforeEach(function() {
          $state.current = {name: 'scores.board'};
        });

        it('should set selectedMatch when $state identifies match', function () {
          $state.params = valid;
          var vm = scoreController(sampleResponse);
          expect(vm.selectedMatch).toEqual(valid);
        });

        it('should not set selectedMatch $state identifies not found match', function () {
          $state.params = invalid;
          var vm = scoreController(sampleResponse);
          expect(vm.selectedMatch).toBe(null);
        });
      });
    });

    describe('#selectMatchChange', function () {
      var selected = {id: 10};
      var vm;
      beforeEach(function() {
        $state.transitionToParams = null;
        $state.transitionToState = null;
        vm = scoreController(sampleResponse);
        vm.selectedMatch = selected;
        vm.selectedMatchChange();
      });

      it('should set params', function () {
        expect($state.transitionToParams).toEqual(selected);
      });

      it('should set state', function () {
        expect($state.transitionToState).toEqual('scores.board');
      });
    });


    function MockState() {
      var _this = this;

      _this.transitionTo = function(state, params) {
        this.transitionToParams = params;
        this.transitionToState = state;
      };
      _this.current = {};
      _this.params = {};
   }

  });


})();
