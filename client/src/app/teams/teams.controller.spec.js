(function () {
  'use strict';

  describe('controller teams', function () {
    var $controller;
    var $scope;

    var sampleTeams = [
      {
        name: "sample name",
        id: 33,
        first_player: {id: 44, name: 'first'},
        second_player: {id: 55, name: 'second'}
      }
    ];

    var samplePost = [
      {
        name: "sample name"
        // TODO: test select_first_player, select_second_player
        // first_player: {id: 44, name: 'first'},
        // second_player: {id: 55, name: 'second'}
      }
    ];

    beforeEach(module('frontend'));
    beforeEach(inject(function (_$controller_, $rootScope) {
      $controller = _$controller_;
      $scope = $rootScope.$new();
    }));


    describe('loading', function () {
      it('should load', function () {
        var vm;
        vm = $controller('TeamController', {
          $scope: $scope,
          response: sampleTeams
        });
        expect(vm.loadingFailed).toBe(false);
      });

      it('should fail', function () {
        var vm;
        vm = $controller('TeamController', {
          $scope: $scope,
          response: {error: 'something'}
        });
        expect(vm.loadingFailed).toBe(true);
      });
    });

  });
})();
