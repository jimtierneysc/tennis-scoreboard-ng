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
        first_player: 44,
        second_player: 55,
        doubles: true,
        created_at: "2016-05-07T05:05:42.589Z",
        updated_at: "2016-05-07T05:05:42.589Z"
      }
    ];

    beforeEach(module('frontend'));
    beforeEach(inject(function (_$controller_, $rootScope, _$httpBackend_, _teamsResource_) {
      $httpBackend = _$httpBackend_;
      $controller = _$controller_;
      $scope = $rootScope.$new();
      resourceService = _teamsResource_;
    }));


    describe('loading', function() {

      it('should load', function () {
        var vm;
        $httpBackend.when('GET', resourceService.path).respond(
          function() {
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
          expect(vm.teams).toEqual(jasmine.any(Array));
          //expect(angular.isArray(vm.teams)).toBeTruthy();
          expect(vm.teams.length).toBe(sampleTeams.length);
          expect(angular.equals(vm.teams[0], sampleTeams[0])).toBeTruthy;
        });

        it('should add 1', function () {
          $httpBackend.when('POST', resourceService.path).respond(201, {mergeKey: "mergeValue"});
          vm.newTeam = {name: "newname"};
          vm.submitNewTeamForm();
          $httpBackend.flush();

          expect(angular.isArray(vm.teams)).toBeTruthy();
          expect(vm.teams.length).toBe(sampleTeams.length + 1);
          expect(vm.teams[0].mergeKey).toBe("mergeValue");
          expect(vm.teams[0].name).toBe("newname");
        });

        it('should delete 1', function () {
          var toRemove = vm.teams[0];
          $httpBackend.when('DELETE', resourceService.path + '/' + toRemove.id).respond(200, {});
          vm.destroyTeam(toRemove, false);  // do not confirm: false
          $httpBackend.flush();
          expect(angular.isArray(vm.teams)).toBeTruthy();
          expect(vm.teams.length).toBe(sampleTeams.length - 1);
        });

        it('should capture create error', function () {
          $httpBackend.when('POST', resourceService.path).respond(422, {"name":["has already been taken"]});
          vm.newTeam = sampleTeams[0];
          vm.submitNewTeamForm();
          $httpBackend.flush();

          expect(vm.teams.length).toBe(sampleTeams.length);
          expect(vm.teamCreateErrors).toEqual(jasmine.any(Object));
          expect(vm.teamCreateErrors.name).toEqual(jasmine.any(Array));
          expect(vm.teamCreateErrors.name.length).toBe(1);
          expect(vm.teamCreateErrors.name[0]).toEqual(jasmine.stringMatching('has already been taken'));
        });

        it('should capture delete error', function () {
          $httpBackend.when('DELETE', resourceService.path + '/999').respond(404, {"error": "not found"});
          vm.destroyTeam({id: 999}, false);  // do not confirm: false
          $httpBackend.flush();
          expect(vm.teams.length).toBe(sampleTeams.length);
          expect(vm.lastToast).toEqual(jasmine.any(Object));
          expect(vm.lastToast.iconClass).toEqual('toast-error')
        });

      }
    )
  });
})();
