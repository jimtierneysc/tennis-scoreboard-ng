(function () {
  'use strict';

  describe('teams controller', function () {
    var $httpBackend;
    var $controller;
    var $scope;
    var resourceService;

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
    beforeEach(inject(function (_$controller_, $rootScope, _$httpBackend_, _teamsResource_) {
      $httpBackend = _$httpBackend_;
      $controller = _$controller_;
      $scope = $rootScope.$new();
      resourceService = _teamsResource_;
    }));


    describe('loading', function () {

      it('should load', function () {
        var vm;
        $httpBackend.when('GET', resourceService.path).respond(
          function () {
            return [200, sampleTeams]
          });
        vm = $controller('TeamController', {
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
        vm = $controller('TeamController', {
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
          $httpBackend.when('GET', resourceService.path).respond(200, sampleTeams);
          vm = $controller('TeamController', {
            $scope: $scope
          });
          $httpBackend.flush();

        });

        it('should get', function () {
          expect(vm.entitys).toEqual(jasmine.any(Array));
          //expect(angular.isArray(vm.entitys)).toBeTruthy();
          expect(vm.entitys.length).toBe(sampleTeams.length);
          // expect(angular.equals(vm.entitys[0], sampleTeams[0])).toBeTruthy;
        });

        it('should add 1', function () {
          $httpBackend.when('POST', resourceService.path).respond(201, {mergeKey: "mergeValue"});
          vm.newEntity = {name: "newname"};
          vm.submitNewEntityForm();
          $httpBackend.flush();

          expect(angular.isArray(vm.entitys)).toBeTruthy();
          expect(vm.entitys.length).toBe(sampleTeams.length + 1);
          expect(vm.entitys[0].mergeKey).toBe("mergeValue");
          expect(vm.entitys[0].name).toBe("newname");
        });

        it('should delete 1', function () {
          var toRemove = vm.entitys[0];
          $httpBackend.when('DELETE', resourceService.path + '/' + toRemove.id).respond(200, {});
          vm.trashEntity(toRemove, false);  // do not confirm: false
          $httpBackend.flush();
          expect(angular.isArray(vm.entitys)).toBeTruthy();
          expect(vm.entitys.length).toBe(sampleTeams.length - 1);
        });

        it('should format body', function () {
          $httpBackend.expect('POST', resourceService.path, {'team': samplePost[0]}).respond(200, {});
          vm.newEntity = samplePost[0];
          vm.submitNewEntityForm();
          $httpBackend.flush();
        });


        it('should capture create error', function () {
          $httpBackend.when('POST', resourceService.path).respond(422, {"name": ["has already been taken"]});
          vm.newEntity = sampleTeams[0];
          vm.submitNewEntityForm();
          $httpBackend.flush();

          expect(vm.entitys.length).toBe(sampleTeams.length);
          expect(vm.entityCreateErrors).toEqual(jasmine.any(Object));
          expect(vm.entityCreateErrors.name).toEqual(jasmine.any(Array));
          expect(vm.entityCreateErrors.name.length).toBe(1);
          expect(vm.entityCreateErrors.name[0]).toEqual(jasmine.stringMatching('has already been taken'));
        });

        it('should capture delete error', function () {
          $httpBackend.when('DELETE', resourceService.path + '/999').respond(404, {"error": "not found"});
          vm.trashEntity({id: 999}, false);  // do not confirm: false
          $httpBackend.flush();
          expect(vm.entitys.length).toBe(sampleTeams.length);
          expect(vm.lastToast).toEqual(jasmine.any(Object));
          expect(vm.lastToast.iconClass).toEqual('toast-error')
        });

      }
    )
  });
})();
