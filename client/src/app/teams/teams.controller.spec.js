(function () {
  'use strict';

  describe('controller teams', function () {
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

    beforeEach(module('frontend'));
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
      return $controller('TeamController', locals);
    }

    describe('members', function () {
      var vm;

      beforeEach(function () {
        vm = teamController(sampleResponse);
      });

      describe('supports', function () {

        it('should support auth', function () {
          expect(vm.supportsAuth).toBeTruthy();
        });

        it('should support crud', function () {
          expect(vm.supportsCrud).toBeTruthy();
        });

      });

      describe('options lists', function () {

        it('has players options', function () {
          expect(vm.playerOptionsList).toEqual(jasmine.any(Object));
        });
      });

    });

    describe('loading', function () {

      it('should load', function () {
        var vm = teamController(sampleResponse);
        expect(vm.loadingFailed).toBeFalsy();
      });

      it('should fail', function () {
        var vm = teamController({error: 'something'});
        expect(vm.loadingFailed).toBeTruthy();
      });
    });

    describe('mock crudHelper', function () {
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
      })

      it('should activate mock', function () {
        expect(crudMock.activated()).toBeTruthy();
      });

      describe('crud options', function () {
        var options;
        beforeEach(function () {
          options = crudMock.options;
        });

        it('should have options', function () {
          expect(options).toEqual(jasmine.any(Object));
        });

        it('should have resource name', function () {
          expect(options.resourceName).toEqual('teams');
        });

        it('should have prepareToCreateEntity', function () {
          expect(options.prepareToCreateEntity).toEqual(jasmine.any(Function));
        });

        it('should have prepareToUpdateEntity', function () {
          expect(options.prepareToUpdateEntity).toEqual(jasmine.any(Function));
        });

        it('should have beforeShowNewEntity', function () {
          expect(options.beforeShowNewEntity).toEqual(jasmine.any(Function));
        });

        it('should have beforeShowEditEntity', function () {
          expect(options.beforeShowEditEntity).toEqual(jasmine.any(Function));
        });

        it('should have getEntityDisplayName', function () {
          expect(options.getEntityDisplayName).toEqual(jasmine.any(Function));
        });

        it('should have makeEntityBody', function () {
          expect(options.makeEntityBody).toEqual(jasmine.any(Function));
        });

        it('should have scope', function () {
          expect(options.scope).toEqual(jasmine.any(Object));
        });

        it('should have errorCategories', function () {
          expect(options.errorCategories).toEqual(jasmine.any(Object));
        });

        describe('getEntityDisplayName', function () {

          it('should return title', function () {
            expect(options.getEntityDisplayName({name: 'amatch'})).toEqual('amatch');
          });

          it('should return untitled', function () {
            expect(options.getEntityDisplayName({name: ''})).toEqual('(unnamed)');
          });

        });

        describe('makeEntityBody', function () {

          it('should return value', function () {
            expect(options.makeEntityBody({})).toEqual({team: {}});
          });
        });

        describe('prepare to submit entities', function () {

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

          describe('prepareToCreateEntity', function () {

            var prepared;

            beforeEach(function () {
              prepared = options.prepareToCreateEntity(sampleEntity);
            })

            it('should prepare', function () {
              expect(prepared).toEqual(samplePrepared);
            });

          });

          describe('prepareToUpdateEntity', function () {

            var prepared;
            var expected;
            var entity;

            beforeEach(function () {
              entity = angular.merge({}, sampleEntity, {id: 1});
              expected = angular.merge({}, samplePrepared, {id: 1});
              prepared = options.prepareToUpdateEntity(entity);
            })

            it('should prepare', function () {
              expect(prepared).toEqual(expected);
            });
          });
        });

        describe('beforeShowNewEntity', function () {

          describe('before call', function () {
            it('should not have player select options', function () {
              expect(vm.playerOptionsList.list).toEqual(null);
            });
          });

          describe('after call', function () {
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
                selectOptionsMock.reject();
                options.beforeShowNewEntity();
                $rootScope.$digest(); // resolve player and team lists
              });

              it('should have player select options', function () {
                expect(vm.playerOptionsList.list).toEqual([]);
              });
            });
          });
        });

        describe('beforeShowEditEntity', function () {
          describe('before call', function () {
            it('should not have player select options', function () {
              expect(vm.playerOptionsList.list).toEqual(null);
            });
          });

          describe('after call', function () {

            describe('options lists', function () {

              beforeEach(function () {
                vm.editEntity = {};
                options.beforeShowEditEntity();
                $rootScope.$digest(); // resolve player and team lists
              });

              it('should player select options', function () {
                expect(vm.playerOptionsList.list).toEqual(selectOptionsMock.playerList);
              });
            });

            describe('select players', function () {
              var firstPlayer, secondPlayer;

              beforeEach(function () {
                firstPlayer = selectOptionsMock.playerList[0];
                secondPlayer = selectOptionsMock.playerList[1];
                vm.editEntity = {
                  first_player: firstPlayer,
                  second_player: secondPlayer
                };
                options.beforeShowEditEntity();
                $rootScope.$digest(); // resolve player and team lists
              });

              it('should select first player', function () {
                expect(vm.editEntity.select_first_player).toEqual(firstPlayer);
              });

              it('should select second player', function () {
                expect(vm.editEntity.select_second_player).toEqual(secondPlayer);
              });
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
      vm.newEntity = {};
      vm.editEntity = {};

    }

  }

  function SelectOptionsMock(_$q_) {

    var $q = _$q_;
    var _this = this;

    var playerList = [
      {name: 'player1', id: 1},
      {name: 'player2', id: 2}
    ];
    var reject = false;

    _this.playerList = playerList;

    _this.reject = function () {
      reject = true;
    };

    // Return a promise
    _this.getPlayersSelectOptions = function () {
      return getSelectOptions(playerList);
    };

    function getSelectOptions(list) {
      var deferred = $q.defer();
      if (reject)
        deferred.reject()
      else
        deferred.resolve(list);
      return deferred.promise;
    }
  }
})();

