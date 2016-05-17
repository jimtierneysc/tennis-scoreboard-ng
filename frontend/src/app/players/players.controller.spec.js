(function () {
  'use strict';

  describe('players controller', function () {
    var $httpBackend;
    var $controller;
    var $scope;
    var resourceService;

    var samplePlayers = [
      {
        name: "sample name",
        id: 33,
        created_at: "2016-05-07T05:05:42.589Z",
        updated_at: "2016-05-07T05:05:42.589Z"
      }
    ];

    beforeEach(module('frontend'));
    beforeEach(inject(function (_$controller_, $rootScope, _$httpBackend_, _playersResource_) {
      $httpBackend = _$httpBackend_;
      $controller = _$controller_;
      $scope = $rootScope.$new();
      resourceService = _playersResource_;
    }));


    describe('loading', function() {

      it('should load', function () {
        var vm;
        $httpBackend.when('GET', resourceService.path).respond(
          function() {
            return [200, samplePlayers]
          });
        vm = $controller('PlayerController', {
          $scope: $scope
        });
        expect(vm.loading).toBe(true);
        $httpBackend.flush();

        expect(vm.loading).toBe(false);
        expect(vm.loadingFailed).toBe(false);
        expect(vm.loadingFailedMessage).toBe(null);
      });

      it('should fail', function () {
        var vm;
        $httpBackend.when('GET', resourceService.path).respond(500, {'error': 'something went wrong'});
        vm = $controller('PlayerController', {
          $scope: $scope
        });
        $httpBackend.flush();

        expect(vm.loading).toBe(false);
        expect(vm.loadingFailed).toBe(true);
        expect(vm.loadingFailedMessage).toEqual(jasmine.any(String));
      });
    });

    describe('crud', function () {
        var vm;

        beforeEach(function () {
          $httpBackend.when('GET', resourceService.path).respond(200, samplePlayers);
          vm = $controller('PlayerController', {
            $scope: $scope
          });
          $httpBackend.flush();

        });

        it('should get', function () {
          expect(vm.players).toEqual(jasmine.any(Array));
          //expect(angular.isArray(vm.players)).toBeTruthy();
          expect(vm.players.length).toBe(samplePlayers.length);
          expect(angular.equals(vm.players[0], samplePlayers[0])).toBeTruthy;
        });

        it('should add 1', function () {
          $httpBackend.when('POST', resourceService.path).respond(201, {mergeKey: "mergeValue"});
          vm.newPlayer = {name: "newname"};
          vm.submitNewPlayerForm();
          $httpBackend.flush();

          expect(angular.isArray(vm.players)).toBeTruthy();
          expect(vm.players.length).toBe(samplePlayers.length + 1);
          expect(vm.players[0].mergeKey).toBe("mergeValue");
          expect(vm.players[0].name).toBe("newname");
        });

        it('should delete 1', function () {
          var toRemove = vm.players[0];
          $httpBackend.when('DELETE', resourceService.path + '/' + toRemove.id).respond(200, {});
          vm.destroyPlayer(toRemove, false);  // do not confirm: false
          $httpBackend.flush();
          expect(angular.isArray(vm.players)).toBeTruthy();
          expect(vm.players.length).toBe(samplePlayers.length - 1);
        });

        it('should capture create error', function () {
          $httpBackend.when('POST', resourceService.path).respond(422, {"name":["has already been taken"]});
          vm.newPlayer = samplePlayers[0];
          vm.submitNewPlayerForm();
          $httpBackend.flush();

          expect(vm.players.length).toBe(samplePlayers.length);
          expect(vm.playerCreateErrors).toEqual(jasmine.any(Object));
          expect(vm.playerCreateErrors.name).toEqual(jasmine.any(Array));
          expect(vm.playerCreateErrors.name.length).toBe(1);
          expect(vm.playerCreateErrors.name[0]).toEqual(jasmine.stringMatching('has already been taken'));
        });

        it('should capture delete error', function () {
          $httpBackend.when('DELETE', resourceService.path + '/999').respond(404, {"error": "not found"});
          vm.destroyPlayer({id: 999}, false);  // do not confirm: false
          $httpBackend.flush();
          expect(vm.players.length).toBe(samplePlayers.length);
          expect(vm.lastToast).toEqual(jasmine.any(Object));
          expect(vm.lastToast.iconClass).toEqual('toast-error')
        });

      }
    )
  });
})();
