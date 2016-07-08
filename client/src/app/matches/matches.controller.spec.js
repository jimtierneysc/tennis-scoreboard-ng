(function () {
  'use strict';

  describe('controller matches', function () {
    var $controller;
    var $scope;
    var $q;
    var $rootScope;

    var sampleResponse = [
      {
        // title: "doubles title",
        id: 22
        // scoring: "two_six_game_ten_points",
        // doubles: true,
        // state: "complete",
        // winner: 33,
        // first_team: {
        //   id: 33,
        //   name: "first_team",
        //   first_player_name: "first_team_first_player",
        //   second_player_name: "first_team_second_player"
        // },
        // second_team: {
        //   id: 44,
        //   name: "second_team",
        //   first_player_name: "second_team_first_player",
        //   second_player_name: "second_team_second_player"
        // }
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


    function matchController(response, options) {
      var locals = {
        $scope: $scope,
        response: response
      };
      if (options)
        angular.merge(locals, options);
      return $controller('MatchesController', locals);
    }

    describe('members', function () {
      var vm;

      beforeEach(function () {
        vm = matchController(sampleResponse);
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
        it('has team options', function () {
          expect(vm.teamOptionsList).toEqual(jasmine.any(Object));
        });

        it('has players options', function () {
          expect(vm.playerOptionsList).toEqual(jasmine.any(Object));
        });
      });

    });

    describe('loading', function () {

      it('should load', function () {
        var vm = matchController(sampleResponse);
        expect(vm.loadingFailed).toBeFalsy();
      });

      it('should fail', function () {
        var vm = matchController({error: 'something'});
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
        vm = matchController(sampleResponse, {
          // Mock services
          crudHelper: crudMock.crudHelper,
          teamsSelectOptions: selectOptionsMock.getTeamsSelectOptions,
          playersSelectOptions: selectOptionsMock.getPlayersSelectOptions
        })
      });

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
          expect(options.resourceName).toEqual('matches');
        });

        it('should have prepareToCreateEntity', function () {
          expect(options.prepareToCreateEntity).toEqual(jasmine.any(Function));
        });

        it('should have .prepareToUpdateEntity', function () {
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
            expect(options.getEntityDisplayName({title: 'atitle'})).toEqual('atitle');
          });

          it('should return untitled', function () {
            expect(options.getEntityDisplayName({title: ''})).toEqual('(untitled)');
          });

        });

        describe('makeEntityBody', function () {

          it('should return value', function () {
            expect(options.makeEntityBody({})).toEqual({match: {}});
          });
        });

        describe('prepare to update entities', function () {

          var singlesEntity = {
            title: "title",
            scoring: "two_six_game_ten_points",
            doubles: false,
            select_first_player: {id: 1},
            select_second_player: {id: 2}
          };

          var singlesPrepared = {
            title: "title",
            scoring: "two_six_game_ten_points",
            doubles: false,
            first_player_id: 1,
            second_player_id: 2
          };

          var doublesEntity = {
            title: "title",
            scoring: "two_six_game_ten_points",
            doubles: true,
            select_first_team: {id: 1},
            select_second_team: {id: 2}
          };

          var doublesPrepared = {
            title: "title",
            scoring: "two_six_game_ten_points",
            doubles: true,
            first_team_id: 1,
            second_team_id: 2
          };

          describe('prepareToCreateEntity', function () {

            describe('doubles', function () {
              var prepared;

              beforeEach(function () {
                prepared = options.prepareToCreateEntity(doublesEntity);
              })

              it('should prepare', function () {
                expect(prepared).toEqual(doublesPrepared);
              });
            });

            describe('singles', function () {

              var prepared;

              beforeEach(function () {
                prepared = options.prepareToCreateEntity(singlesEntity);
              })

              it('should prepare', function () {
                expect(prepared).toEqual(singlesPrepared);
              });
            });

          });

          describe('prepareToUpdateEntity', function () {
            describe('doubles', function () {
              var prepared;
              var expected;
              var entity;

              beforeEach(function () {
                entity = angular.merge({}, doublesEntity, {id: 1});
                expected = angular.merge({}, doublesPrepared, {id: 1});
                prepared = options.prepareToUpdateEntity(entity);
              })

              it('should prepare', function () {
                expect(prepared).toEqual(expected);
              });
            });

            describe('singles', function () {

              var prepared;
              var expected;
              var entity;

              beforeEach(function () {
                entity = angular.merge({}, singlesEntity, {id: 1});
                expected = angular.merge({}, singlesPrepared, {id: 1});
                prepared = options.prepareToUpdateEntity(entity);
              })

              it('should prepare', function () {
                expect(prepared).toEqual(expected);
              });
            });
          });
        });

        describe('beforeShowNewEntity', function () {

          describe('before call', function () {
            it('should not have player select options', function () {
              expect(vm.playerOptionsList.list).toEqual(null);
            });

            it('should not have team select options', function () {
              expect(vm.teamOptionsList.list).toEqual(null);
            });
          });


          describe('after call', function () {

            describe('default values', function () {
              var entity;

              beforeEach(function () {
                options.beforeShowNewEntity();
                $rootScope.$digest(); // resolve player and team lists
                entity = vm.newEntity;
              });

              it('should default singles', function () {
                expect(entity.doubles).toBeFalsy();
              });

              it('should default two sets', function () {
                expect(entity.scoring).toEqual('two_six_game_ten_point');
              });

            });

            describe('select options filled', function () {
              beforeEach(function () {
                options.beforeShowNewEntity();
                $rootScope.$digest(); // resolve player and team lists
              });

              it('should have player select options', function () {
                expect(vm.playerOptionsList.list).toEqual(selectOptionsMock.playerList);
              });

              it('should have team select options', function () {
                expect(vm.teamOptionsList.list).toEqual(selectOptionsMock.teamList);
              });
            });

            describe('memoize select options', function () {
              beforeEach(function () {
                options.beforeShowNewEntity();
                $rootScope.$digest(); // resolve player and team list
                vm.playerOptionsList.list = {};
                vm.teamOptionsList.list = {};
                // Should not refill lists
                options.beforeShowNewEntity();
                $rootScope.$digest(); // resolve player and team list
              });

              it('should have player select options', function () {
                expect(vm.playerOptionsList.list).toEqual({});
              });

              it('should have team select options', function () {
                expect(vm.teamOptionsList.list).toEqual({});
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

              it('should have team select options', function () {
                expect(vm.teamOptionsList.list).toEqual([]);
              });
            });
          });
        });


        describe('.beforeShowEditEntity', function () {
          describe('before call', function () {
            it('should not have player select options', function () {
              expect(vm.playerOptionsList.list).toEqual(null);
            });

            it('should not have team select options', function () {
              expect(vm.teamOptionsList.list).toEqual(null);
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

              it('should team select options', function () {
                expect(vm.teamOptionsList.list).toEqual(selectOptionsMock.teamList);
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


            describe('select teams', function () {
              var firstTeam, secondTeam;

              beforeEach(function () {
                firstTeam = selectOptionsMock.teamList[0];
                secondTeam = selectOptionsMock.teamList[1];
                vm.editEntity = {
                  first_team: firstTeam,
                  second_team: secondTeam
                };
                options.beforeShowEditEntity();
                $rootScope.$digest(); // resolve player and team lists
              });

              it('should select first team', function () {
                expect(vm.editEntity.select_first_team).toEqual(firstTeam);
              });

              it('should select second team', function () {
                expect(vm.editEntity.select_second_team).toEqual(secondTeam);
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
    var teamList = [
      {name: 'team1', id: 1},
      {name: 'team2', id: 2}
    ];

    var playerList = [
      {name: 'player1', id: 1},
      {name: 'player2', id: 2}
    ];
    var reject = false;

    _this.teamList = teamList;

    _this.playerList = playerList;

    _this.reject = function () {
      reject = true;
    }

    // Return a promise
    _this.getTeamsSelectOptions = function() {
      return getSelectOptions(teamList);
    };

    // Return a promise
    _this.getPlayersSelectOptions = function() {
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

