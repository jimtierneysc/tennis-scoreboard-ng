(function () {
  'use strict';

  describe('TeamsController', function () {
    var $controller;
    var $scope;
    var $q;
    var $rootScope;

    var sampleResponse = [
      {
        name: "one",
        id: 22
      }
    ];

    beforeEach(module('frontendTeams'));
    beforeEach(function () {

      inject(function (_$controller_, _$q_, _$rootScope_) {
        $rootScope = _$rootScope_;
        $controller = _$controller_;
        $scope = $rootScope.$new();
        $q = _$q_;
      })
    });


    function teamController(response, options) {
      var locals = {
        $scope: $scope,
        response: response
      };
      if (options)
        angular.merge(locals, options);
      return $controller('TeamsController', locals);
    }

    describe('members', function () {
      var vm;

      beforeEach(function () {
        vm = teamController(sampleResponse);
      });

      it('should support auth', function () {
        expect(vm).toSupportAuth();
      });

      it('should support crud', function () {
        expect(vm).toSupportCrud();
      });

      it('should have .playerOptionsList', function () {
        expect(vm.playerOptionsList).toEqual(jasmine.any(Object));
      });

    });

    describe('loading', function () {

      it('should not .loadingFailed', function () {
        var vm = teamController(sampleResponse);
        expect(vm).not.toFailLoading();
      });

      it('should .loadingFailed', function () {
        var vm = teamController({error: 'something'});
        expect(vm).toFailLoading();
      });
    });

    describe('crud', function () {
      var crudMock;
      var selectOptionsMock;
      var vm;
      beforeEach(function () {
        crudMock = new CrudMock();
        selectOptionsMock = new SelectOptionsMock($q);
        vm = teamController(sampleResponse, {
          // Mock services
          crudHelper: crudMock.crudHelper,
          playersSelectOptions: selectOptionsMock.getPlayersSelectOptions
        })
      });

      it('should activate', function () {
        expect(crudMock.activated()).toBeTruthy();
      });

      describe('options', function () {
        var options;
        var resourceName;
        beforeEach(function () {
          inject(function (_teamsPath_) {
            resourceName = _teamsPath_;
          });
          options = crudMock.options;
        });

        it('should be crud options', function () {
          // custom matcher
          expect(options).toBeCrudOptions();
        });

        it('should have .resourceName', function () {
          expect(options.resourceName).toEqual(resourceName);
        });

        it('should have .entityKind', function () {
          expect(options.entityKind).toEqual('Team');
        });

        describe('.getEntityDisplayName()', function () {

          it('should return name', function () {
            expect(options.getEntityDisplayName({name: 'ateam'})).toEqual('ateam');
          });

          it('should return (unnamed)', function () {
            expect(options.getEntityDisplayName({name: ''})).toEqual('(unnamed)');
          });
        });

        describe('.makeEntityBody()', function () {
          it('should return value', function () {
            expect(options.makeEntityBody({})).toEqual({team: {}});
          });
        });

        describe('prepare', function () {

          var sampleEntity = {
            name: "title",
            select_first_player: {id: 1},
            select_second_player: {id: 2}
          };

          var samplePrepared = {
            name: "title",
            first_player_id: 1,
            second_player_id: 2
          };

          describe('.prepareToCreateEntity()', function () {
            var prepared;

            beforeEach(function () {
              prepared = options.prepareToCreateEntity(sampleEntity);
            });

            it('should prepare', function () {
              expect(prepared).toEqual(samplePrepared);
            });
          });

          describe('.prepareToUpdateEntity()', function () {

            var prepared;
            var expected;

            beforeEach(function () {
              var entity = angular.merge({}, sampleEntity, {id: 1});
              expected = angular.merge({}, samplePrepared, {id: 1});
              prepared = options.prepareToUpdateEntity(entity);
            });

            it('should prepare', function () {
              expect(prepared).toEqual(expected);
            });
          });
        });

        describe('.beforeShowNewEntity() not called', function () {
          it('should not have player select options', function () {
            expect(vm.playerOptionsList.list).toEqual(null);
          });
        });

        describe('.beforeShowNewEntity()', function () {

          describe('select options filled', function () {
            beforeEach(function () {
              options.beforeShowNewEntity();
              $rootScope.$digest(); // resolve player and team lists
            });

            it('should have player select options', function () {
              expect(vm.playerOptionsList.list).toEqual(selectOptionsMock.playerList);
            });
          });

          describe('memoize select options', function () {
            beforeEach(function () {
              options.beforeShowNewEntity();
              $rootScope.$digest(); // resolve player and team list
              vm.playerOptionsList.list = {};
              // Should not refill lists
              options.beforeShowNewEntity();
              $rootScope.$digest(); // resolve player and team list
            });

            it('should have player select options', function () {
              expect(vm.playerOptionsList.list).toEqual({});
            });
          });

          describe('select options empty', function () {
            beforeEach(function () {
              selectOptionsMock.reject = true;
              options.beforeShowNewEntity();
              $rootScope.$digest(); // resolve player and team lists
            });

            it('should have player select options', function () {
              expect(vm.playerOptionsList.list).toEqual([]);
            });
          });

          describe('not enough players', function () {
            var rejected = false;
            beforeEach(function () {
              selectOptionsMock.setPlayerCount(1);
              options.beforeShowNewEntity().then(
                function () {

                },
                function () {
                  rejected = true;
                }
              );
              $rootScope.$digest(); // resolve player and team lists
            });

            it('should reject', function () {
              expect(rejected).toBeTruthy();
            });
          });

          describe('enough players', function () {
            var resolved = false;
            beforeEach(function () {
              selectOptionsMock.setPlayerCount(3);
              options.beforeShowNewEntity().then(
                function () {
                  resolved = true;
                },
                function () {
                }
              );
              $rootScope.$digest(); // resolve player and team lists
            });

            it('should resolve', function () {
              expect(resolved).toBeTruthy();
            });
          });

          describe('exactly two players', function () {
            beforeEach(function () {
              selectOptionsMock.setPlayerCount(2);
              options.beforeShowNewEntity();
              $rootScope.$digest(); // resolve player and team lists
            });

            it('should automatically select first player', function () {
              expect(vm.newEntity.entity.select_first_player).toEqual(
                selectOptionsMock.playerList[0]);
            });

            it('should automatically select second player', function () {
              expect(vm.newEntity.entity.select_second_player).toEqual(
                selectOptionsMock.playerList[1]);
            });
          });
        });

        describe('.beforeShowEditEntity() not called', function () {
          it('should not have player select options', function () {
            expect(vm.playerOptionsList.list).toEqual(null);
          });
        });

        describe('.beforeShowEditEntity()', function () {

          describe('options lists', function () {

            beforeEach(function () {
              vm.editEntity
              {
                entity: {
                }
              }
              ;
              options.beforeShowEditEntity();
              $rootScope.$digest(); // resolve player and team lists
            });

            it('should have player select options', function () {
              expect(vm.playerOptionsList.list).toEqual(selectOptionsMock.playerList);
            });
          });

          describe('select players', function () {
            var firstPlayer, secondPlayer;

            beforeEach(function () {
              firstPlayer = selectOptionsMock.playerList[0];
              secondPlayer = selectOptionsMock.playerList[1];
              vm.editEntity =
              {
                entity: {
                  first_player: firstPlayer,
                  second_player: secondPlayer
                }
              };
              options.beforeShowEditEntity();
              $rootScope.$digest(); // resolve player and team lists
            });

            it('should select first player', function () {
              expect(vm.editEntity.entity.select_first_player).toEqual(firstPlayer);
            });

            it('should select second player', function () {
              expect(vm.editEntity.entity.select_second_player).toEqual(secondPlayer);
            });
          });
        });
      });
    });
  });


  function CrudMock() {

    var _this = this;

    _this.options = null;
    _this.activated = function () {
      return (_this.options != null);
    };

    _this.crudHelper = activate;

    function activate(vm, options) {
      _this.options = options;
      vm.newEntity = {entity: {}};
      vm.editEntity = {entity: {}};
      vm.showToast = function () {

      };
      vm.beginWait = function () {
        return function () {
        }
      }

    }
  }

  function SelectOptionsMock(_$q_) {

    var $q = _$q_;
    var _this = this;
    _this.setPlayerCount = function (count) {
      _this.playerList = [];
      for (var i = 0; i < count; i++) {
        _this.playerList.push({name: 'player' + i, id: i + 1});
      }
    };

    // Return a promise
    _this.getPlayersSelectOptions = function () {
      return getSelectOptions(_this.playerList);
    };

    _this.reject = false;
    _this.playerList = [];
    _this.setPlayerCount(3);  // default to list of 3

    function getSelectOptions(list) {
      var deferred = $q.defer();
      if (_this.reject)
        deferred.reject();
      else
        deferred.resolve(list);
      return deferred.promise;
    }
  }
})();

