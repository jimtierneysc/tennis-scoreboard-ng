(function () {
  'use strict';

  describe('controller matches', function () {
    var $controller;
    var $scope;
    var $q;
    var $rootScope;

    var sampleResponse = [
      {
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

        it('supports Auth', function () {
          expect(vm).toSupportAuth();
        });

        it('supports Crud', function () {
          expect(vm).toSupportCrud();
        });

      });

      describe('options lists', function () {
        it('has .teamOptionsList', function () {
          expect(vm.teamOptionsList).toEqual(jasmine.any(Object));
        });

        it('has .playerObjectsList', function () {
          expect(vm.playerOptionsList).toEqual(jasmine.any(Object));
        });
      });

    });

    describe('loading', function () {

      it('did not fail', function () {
        var vm = matchController(sampleResponse);
        // custom matcher
        expect(vm).not.toFailLoading();
      });

      it('failed', function () {
        var vm = matchController({error: 'something'});
        // custom matcher
        expect(vm).toFailLoading();
      });
    });

    describe('use crudHelper', function () {
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

      it('is activated', function () {
        expect(crudMock.activated()).toBeTruthy();
      });

      describe('options parameter', function () {
        var options;
        var resourceName;
        beforeEach(function () {
          inject(function (_matchesResource_) {
            resourceName = _matchesResource_;
          });
          options = crudMock.options;
        });

        it('is crud options', function () {
          // custom matcher
          expect(options).toBeCrudOptions();
        });

        it('has .resourceName', function () {
          expect(options.resourceName).toEqual(resourceName);
        });

        describe('.getEntityDisplayName()', function () {
          it('returns title', function () {
            expect(options.getEntityDisplayName({title: 'atitle'})).toEqual('atitle');
          });

          it('returns untitled', function () {
            expect(options.getEntityDisplayName({title: ''})).toEqual('(untitled)');
          });
        });

        describe('.makeEntityBody()', function () {
          it('returns value', function () {
            expect(options.makeEntityBody({})).toEqual({match: {}});
          });
        });

        describe('prepare to change entities', function () {

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

          describe('.prepareToCreateEntity()', function () {

            describe('doubles', function () {
              var prepared;

              beforeEach(function () {
                prepared = options.prepareToCreateEntity(doublesEntity);
              });

              it('prepared', function () {
                expect(prepared).toEqual(doublesPrepared);
              });
            });

            describe('singles', function () {

              var prepared;

              beforeEach(function () {
                prepared = options.prepareToCreateEntity(singlesEntity);
              });

              it('prepared', function () {
                expect(prepared).toEqual(singlesPrepared);
              });
            });
          });

          describe('.prepareToUpdateEntity()', function () {
            describe('doubles', function () {
              var prepared;
              var expected;

              beforeEach(function () {
                var entity = angular.merge({}, doublesEntity, {id: 1});
                expected = angular.merge({}, doublesPrepared, {id: 1});
                prepared = options.prepareToUpdateEntity(entity);
              });

              it('prepared', function () {
                expect(prepared).toEqual(expected);
              });
            });

            describe('singles', function () {

              var prepared;
              var expected;

              beforeEach(function () {
                var entity = angular.merge({}, singlesEntity, {id: 1});
                expected = angular.merge({}, singlesPrepared, {id: 1});
                prepared = options.prepareToUpdateEntity(entity);
              });

              it('prepared', function () {
                expect(prepared).toEqual(expected);
              });
            });
          });
        });

        describe('.beforeShowNewEntity()', function () {

          describe('before call', function () {
            expectNullOptionsLists();
          });


          describe('after call', function () {

            describe('default values', function () {
              var entity;

              beforeEach(function () {
                options.beforeShowNewEntity();
                $rootScope.$digest(); // resolve player and team lists
                entity = vm.newEntity;
              });

              it('defaults to singles', function () {
                expect(entity.doubles).toBeFalsy();
              });

              it('defaults 2 sets', function () {
                expect(entity.scoring).toEqual('two_six_game_ten_point');
              });

            });

            describe('select options filled', function () {
              beforeEach(function () {
                options.beforeShowNewEntity();
                $rootScope.$digest(); // resolve player and team lists
              });

              expectOptionsLists();
            });

            describe('memoize select options', function () {
              beforeEach(function () {
                options.beforeShowNewEntity();
                $rootScope.$digest(); // resolve player and team list
                vm.playerOptionsList.list = [];
                vm.teamOptionsList.list = [];
                // Should not refill lists
                options.beforeShowNewEntity();
                $rootScope.$digest(); // resolve player and team list
              });

              expectEmptyOptionsLists();
            });

            describe('select options empty', function () {
              beforeEach(function () {
                selectOptionsMock.reject();
                options.beforeShowNewEntity();
                $rootScope.$digest(); // resolve player and team lists
              });

              expectEmptyOptionsLists();
            });
          });
        });


        describe('.beforeShowEditEntity', function () {
          describe('before call', function () {

            expectNullOptionsLists();
          });

          describe('after call', function () {

            describe('options lists', function () {

              beforeEach(function () {
                vm.editEntity = {};
                options.beforeShowEditEntity();
                $rootScope.$digest(); // resolve player and team lists
              });

              expectOptionsLists();
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

        function expectOptionsLists() {
          it('has .playerOptionsList.list', function () {
            expect(vm.playerOptionsList.list).toEqual(selectOptionsMock.playerList);
          });

          it('has .teamOptionsList.list', function () {
            expect(vm.teamOptionsList.list).toEqual(selectOptionsMock.teamList);
          });
        }

        function expectNullOptionsLists() {
          it('has null .playerOptionsList.list', function () {
            expect(vm.playerOptionsList.list).toBe(null);
          });

          it('has null .teamOptionsList.list', function () {
            expect(vm.teamOptionsList.list).toBe(null);
          });
        }

        function expectEmptyOptionsLists() {
          it('has empty .playerOptionsList.list', function () {
            expect(vm.playerOptionsList.list).toEqual([]);
          });

          it('has empty .teamOptionsList.list', function () {
            expect(vm.teamOptionsList.list).toEqual([]);
          });
        }

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
    };

    // Return a promise
    _this.getTeamsSelectOptions = function () {
      return getSelectOptions(teamList);
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

