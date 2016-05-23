(function () {
  'use strict';

  describe('matches controller', function () {
    var $httpBackend;
    var $controller;
    var $scope;
    var resourceService;

    var sampleMatches = [
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
          vm.newEntity = {name: "newname"};
          vm.submitNewEntityForm();
          $httpBackend.flush();

          expect(angular.isArray(vm.entitys)).toBeTruthy();
          expect(vm.entitys.length).toBe(sampleMatches.length + 1);
          expect(vm.entitys[0].mergeKey).toBe("mergeValue");
          expect(vm.entitys[0].name).toBe("newname");
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
          $httpBackend.expect('POST', resourceService.path, {'match': sampleMatches[0]}).respond(200, {});
          vm.newEntity = sampleMatches[0];
          vm.submitNewEntityForm();
          $httpBackend.flush();
        });


        it('should capture create error', function () {
          $httpBackend.when('POST', resourceService.path).respond(422, {"name": ["has already been taken"]});
          vm.newEntity = sampleMatches[0];
          vm.submitNewEntityForm();
          $httpBackend.flush();

          expect(vm.entitys.length).toBe(sampleMatches.length);
          expect(vm.entityCreateErrors).toEqual(jasmine.any(Object));
          expect(vm.entityCreateErrors.name).toEqual(jasmine.any(Array));
          expect(vm.entityCreateErrors.name.length).toBe(1);
          expect(vm.entityCreateErrors.name[0]).toEqual(jasmine.stringMatching('has already been taken'));
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
