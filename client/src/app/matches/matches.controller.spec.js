(function () {
  'use strict';

  describe('matches controller', function () {
    var $httpBackend;
    var $controller;
    var $scope;
    var resourceService;

    var samplePost = [
      {
        title: "doubles title",
        scoring: "two_six_game_ten_points",
        doubles: true
        // TODO: Test select_first_player, select_second_player
        // first_player_id: 66,
        // second_player_id: 77
      }
    ];

    var sampleMatches = [
      {
        title: "doubles title",
        id: 22,
        scoring: "two_six_game_ten_points",
        doubles: true,
        state: "complete",
        winner: 33,
        first_team: {
          id: 33,
          name: "first_team",
          first_player_name: "first_team_first_player",
          second_player_name: "first_team_second_player"
        },
        second_team: {
          id: 44,
          name: "second_team",
          first_player_name: "second_team_first_player",
          second_player_name: "second_team_second_player"
        }
      },
      {
        title: "singles title",
        id: 55,
        scoring: "two_six_game_ten_points",
        doubles: false,
        state: "complete",
        winner: 66,
        first_player: {
          id: 66,
          name: "first_player_name"
        },
        second_player: {
          id: 77,
          name: "second_player_name"
        }
      }
    ];

    beforeEach(module('frontend'));
    beforeEach(inject(function (_$controller_, $rootScope, _$httpBackend_, _matchesResource_) {
      $httpBackend = _$httpBackend_;
      $controller = _$controller_;
      $scope = $rootScope.$new();
      resourceService = _matchesResource_;
    }));


    describe('loading', function () {

      it('should load', function () {
        var vm;
        $httpBackend.when('GET', resourceService.path).respond(
          function () {
            return [200, sampleMatches]
          });
        vm = $controller('MatchController', {
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
        vm = $controller('MatchController', {
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
          $httpBackend.when('GET', resourceService.path).respond(200, sampleMatches);
          vm = $controller('MatchController', {
            $scope: $scope
          });
          $httpBackend.flush();

        });

        it('should get', function () {
          expect(vm.entitys).toEqual(jasmine.any(Array));
          //expect(angular.isArray(vm.entitys)).toBeTruthy();
          expect(vm.entitys.length).toBe(sampleMatches.length);
          // expect(angular.equals(vm.entitys[0], sampleMatches[0])).toBeTruthy;
        });

        it('should add 1', function () {
          $httpBackend.when('POST', resourceService.path).respond(201, {mergeKey: "mergeValue"});
          vm.newEntity = {title: "newname"};
          vm.submitNewEntityForm();
          $httpBackend.flush();

          expect(angular.isArray(vm.entitys)).toBeTruthy();
          expect(vm.entitys.length).toBe(sampleMatches.length + 1);
          expect(vm.entitys[0].mergeKey).toBe("mergeValue");
          expect(vm.entitys[0].title).toBe("newname");
        });

        it('should delete 1', function () {
          var toRemove = vm.entitys[0];
          $httpBackend.when('DELETE', resourceService.path + '/' + toRemove.id).respond(200, {});
          vm.trashEntity(toRemove, false);  // do not confirm: false
          $httpBackend.flush();
          expect(angular.isArray(vm.entitys)).toBeTruthy();
          expect(vm.entitys.length).toBe(sampleMatches.length - 1);
        });

        it('should format body', function () {
          $httpBackend.expect('POST', resourceService.path, {'match': samplePost[0]}).respond(200, {});
          vm.newEntity = samplePost[0];
          vm.submitNewEntityForm();
          $httpBackend.flush();
        });


        it('should capture create error', function () {
          $httpBackend.when('POST', resourceService.path).respond(422, {"title": ["has already been taken"]});
          vm.newEntity = sampleMatches[0];
          vm.submitNewEntityForm();
          $httpBackend.flush();

          expect(vm.entitys.length).toBe(sampleMatches.length);
          expect(vm.entityCreateErrors).toEqual(jasmine.any(Object));
          expect(vm.entityCreateErrors.title).toEqual(jasmine.any(Array));
          expect(vm.entityCreateErrors.title.length).toBe(1);
          expect(vm.entityCreateErrors.title[0]).toEqual(jasmine.stringMatching('has already been taken'));
        });

        it('should capture delete error', function () {
          $httpBackend.when('DELETE', resourceService.path + '/999').respond(404, {"error": "not found"});
          vm.trashEntity({id: 999}, false);  // do not confirm: false
          $httpBackend.flush();
          expect(vm.entitys.length).toBe(sampleMatches.length);
          expect(vm.lastToast).toEqual(jasmine.any(Object));
          expect(vm.lastToast.iconClass).toEqual('toast-error')
        });

      }
    )
  });
})();
