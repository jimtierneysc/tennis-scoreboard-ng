/**
 * @ngdoc factory
 * @name crudHelper
 * @description
 * Add CRUD functionality to a controller
 *
 */
(function () {
  'use strict';

  angular
    .module('frontend')
    .factory('crudHelper', factory);

  /** @ngInject */
  function factory($log, $q, modalConfirm, toastr,
                   $filter, loadingHelper, errorsHelper, toastrHelper,
                   waitIndicator, crudResource) {
    return activate;

    function activate(vm, options) {
      var response = options.response;
      var errorCategories = options.errorCategories;
      var scope = options.scope;

      // Aggregate functionality from other helpers
      loadingHelper(vm);
      toastrHelper(vm, scope);
      errorsHelper(vm, errorCategories);

      var operations = new Operations(vm, options);

      vm.supportsCrud = true;
      // Aggregate crud methods and properties
      vm.trashEntity = operations.trashEntity;
      vm.submitNewEntity = operations.submitNewEntity;
      vm.showNewEntity = operations.showNewEntity;
      vm.hideNewEntity = operations.hideNewEntity;
      vm.submitEditEntity = operations.submitEditEntity;
      vm.showEditEntity = operations.showEditEntity;
      vm.hideEditEntity = operations.hideEditEntity;
      vm.showingEditEntity = operations.showingEditEntity;

      vm.newEntity = {};
      vm.editEntity = null;
      vm.showingNewEntity = false;
      vm.newEntityForm = null;
      vm.editEntityForm = null;
      vm.entitys = [];
      vm.entityCreateErrors = null;
      vm.entityUpdateErrors = null;

      if (angular.isArray(response))
        operations.entityLoaded(response);
      else
        operations.entityLoadFailed(response);
    }

    // Execute code in context of vm
    function Operations(_vm_, controllerOptions) {
      var helper = this;
      var vm = _vm_
      var getResource = function() {
        return crudResource.getResource(controllerOptions.resourceName)
      };
      var prepareToCreateEntity = controllerOptions.prepareToCreateEntity;
      var prepareToUpdateEntity = controllerOptions.prepareToUpdateEntity;
      var beforeShowNewEntity = controllerOptions.beforeShowNewEntity;
      var beforeShowEditEntity = controllerOptions.beforeShowEditEntity;
      var getEntityDisplayName = controllerOptions.getEntityDisplayName;
      var makeEntityBody = controllerOptions.makeEntityBody;

      helper.trashEntity = function (entity, confirmDelete) {
        if (angular.isUndefined(confirmDelete))
          confirmDelete = true;
        if (confirmDelete) {
          modalConfirm.confirm({
            title: 'Confirm Delete', text: 'Are you sure you want to delete "' +
            getEntityDisplayName(entity) + '"?'
          })
            .then(function () {
              removeEntity(entity)
            });
        }
        else {
          removeEntity(entity)
        }
      };

      helper.submitNewEntity = function () {
        var submitEntity = prepareToCreateEntity(vm.newEntity);
        createEntity(submitEntity);
      };

      helper.showNewEntity = function () {
        vm.newEntity = {};
        if (beforeShowNewEntity) beforeShowNewEntity();
        vm.showingNewEntity = true;
      };

      helper.hideNewEntity = function () {
        if (vm.newEntityForm) {
          vm.newEntityForm.$setPristine();
        }
        vm.showingNewEntity = false;
        vm.newEntity = null;
        vm.entityCreateErrors = null;
      };

      helper.submitEditEntity = function () {
        var submit = prepareToUpdateEntity(vm.editEntity);
        updateEntity(submit);
      };

      helper.showEditEntity = function (entity) {
        // Edit a copy, so can discard unless click Save
        vm.editEntity = angular.copy(entity);
        if (beforeShowEditEntity) beforeShowEditEntity();
      };

      helper.hideEditEntity = function () {
        if (vm.editEntityForm) {
          vm.editEntityForm.$setPristine();
        }
        vm.editEntity = null;
        vm.entityUpdateErrors = null;
      };

      helper.showingEditEntity = function (entity) {
        return vm.editEntity && (vm.editEntity.id == entity.id);
      };

      helper.entityLoaded = function (response) {
        vm.entitys = response;
        vm.loadingHasCompleted();
      }

      helper.entityLoadFailed = function (response) {
        $log.error('data error ' + response.status + " " + response.statusText);
        vm.loadingHasFailed(response);
      }

      //
      // Internal methods
      //

      function createEntity(entity) {
        var body = makeEntityBody(entity);
        var endWait = waitIndicator.beginWait();
        getResource().save(body,
          function (response) {
            endWait();
            var newEntity = angular.copy(entity);
            angular.merge(newEntity, response);
            entityCreated(newEntity);
          },
          function (response) {
            $log.error('create error ' + response.status + " " + response.statusText);
            endWait();
            entityCreateError(entity, response);
          }
        );
      }

      function updateEntity(entity) {
        var id = entity.id;
        var key = {id: id};
        var body = makeEntityBody(entity);
        var endWait = waitIndicator.beginWait();
        getResource().update(key, body,
          function (response) {
            endWait();
            var updatedEntity = angular.copy(entity);
            angular.merge(updatedEntity, response);
            entityUpdated(updatedEntity);
          },
          function (response) {
            $log.error('update error ' + response.status + " " + response.statusText);
            endWait();
            entityUpdateError(entity, response);
          }
        );
      }

      function removeEntity(entity) {
        var id = entity.id;
        var key = {id: id};
        var endWait = waitIndicator.beginWait();
        getResource().remove(key,
          function () {
            endWait();
            entityRemoved(entity);
          },
          function (response) {
            $log.error('remove entity error ' + response.status + " " + response.statusText);
            endWait();
            entityRemoveError(entity, response);
          }
        );

      }

      function entityCreated(entity) {
        helper.hideNewEntity();
        vm.entitys.splice(0, 0, entity);
        vm.entityCreateErrors = null;
      }

      function entityUpdated(entity) {
        helper.hideEditEntity();
        var id = entity.id;
        var found = $filter('filter')(vm.entitys, function (o) {
          return o.id === id;
        });
        if (found && found.length === 1) {
          angular.copy(entity, found[0]);
        }
       }

      function entityCreateError(entity, response) {
        var errors = vm.errorsOfResponse(response);
        vm.entityCreateErrors = errors;
      }

      function entityUpdateError(entity, response) {
        var errors = vm.errorsOfResponse(response);
        vm.entityUpdateErrors = errors;
      }

      function entityRemoved(entity) {
        vm.entityRemoveErrors = null;
        var i = vm.entitys.indexOf(entity);
        if (i >= 0) {
          vm.entitys.splice(i, 1);
        }
      }

      function entityRemoveError(entity, response) {
        var message = "";
        if (angular.isObject(response.data)) {
          var errors = vm.errorsOfResponse(response);
          if (angular.isDefined(errors.other[0]))
            message = errors.other[0];
        }
        vm.showToastrError(message, "Delete Error");
      }
    }
  }
})();




