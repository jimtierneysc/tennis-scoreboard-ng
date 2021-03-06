(function () {
  'use strict';

  describe('ScoresController', function () {
    var $controller;
    var $scope;
    var $state;
    var $timeout;

    var sampleResponse = [
      {
        id: 1,
        name: "xyz"
      }
    ];

    beforeEach(module('app.scores'));

    beforeEach(inject(function (_$controller_, $rootScope, _$timeout_) {
      $controller = _$controller_;
      $scope = $rootScope.$new();
      $state = new MockState();
      $timeout = _$timeout_;
    }));


    function scoreController(response) {
      var locals = {
        $scope: $scope,
        $state: $state,
        response: response
      };
      return $controller('ScoresController', locals);
    }

    describe('supports', function () {
      var vm;

      beforeEach(function () {
        vm = scoreController(sampleResponse);
      });

      it('supports auth', function () {
        expect(vm).toSupportAuth();
      });

      it('supports loading', function () {
        // custom matcher
        expect(vm).toSupportLoading();
      });
    });

    describe('loading', function () {

      it('should not fail', function () {
        var vm = scoreController(sampleResponse);
        expect(vm).not.toFailLoading();
      });

      it('should fail', function () {
        var vm = scoreController({error: 'something'});
        expect(vm).toFailLoading();
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

        it('should not set selectedMatch when $state identifies unknown match', function () {
          $state.params = invalid;
          var vm = scoreController(sampleResponse);
          expect(vm.selectedMatch).toBe(null);
        });
      });
    });

    describe('.selectMatchChange()', function () {
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
