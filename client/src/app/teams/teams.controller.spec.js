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
      return $controller('TeamsController', locals);
    }

    describe('members', function () {
      var vm;

      beforeEach(function () {
        vm = teamController(sampleResponse);
      });

      describe('supports', function () {

        it('supports auth', function () {
          expect(vm).toSupportAuth();
        });

        it('supports crud', function () {
          expect(vm).toSupportCrud();
        });
      });

      describe('options lists', function () {
        it('has .playerOptionsList', function () {
          expect(vm.playerOptionsList).toEqual(jasmine.any(Object));
        });
      });

    });

    describe('loading', function () {

      it('is not .loadingFailed', function () {
        var vm = teamController(sampleResponse);
        expect(vm).not.toFailLoading();
      });

      it('is .loadingFailed', function () {
        var vm = teamController({error: 'something'});
        expect(vm).toFailLoading();
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
      });

      it('should activate mock', function () {
        expect(crudMock.activated()).toBeTruthy();
      });

      describe('crud options', function () {
        var options;
        var resourceName;
        beforeEach(function () {
          inject(function(_teamsResource_) {
            resourceName = _teamsResource_;
          });
          options = crudMock.options;
        });

        it('is crud options', function() {
          // custom matcher
          expect(options).toBeCrudOptions();
        });
        
        it('should have resource name', function () {
          expect(options.resourceName).toEqual(resourceName);
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

