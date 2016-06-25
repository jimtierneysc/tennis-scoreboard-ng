/**
 * @ngdoc factory
 * @name crudHelper
 * @description
 * Common functionality shared by CRUD controllers
 *
 */
(function () {
  'use strict';

  angular
    .module('frontend')
    .factory('crudHelper', crudHelperFunc);

  /** @ngInject */
  function crudHelperFunc($log, $q, modalConfirm, toastr, feUtils, $filter, loadingHelper, errorsHelper, toastrHelper,
                          waitIndicator) {
    var service = {
      activate: activateFunc
    };
    return service;
    
    function activateFunc(vm, controllerOptions) {
      var response = controllerOptions.response;
      var errorCategories = controllerOptions.errorCategories;
      var scope = controllerOptions.scope;

      // Initialize controller
      loadingHelper.activate(vm);
      toastrHelper.activate(vm, scope);
      errorsHelper.activate(vm, errorCategories);
      
      var helper = new Helper(vm, controllerOptions);

      vm.trashEntity = helper.trashEntity;
      vm.submitNewEntityForm = helper.submitNewEntityForm;
      vm.showNewEntityForm = helper.showNewEntityForm;
      vm.hideNewEntityForm = helper.hideNewEntityForm;
      vm.submitEditEntityForm = helper.submitEditEntityForm;
      vm.showEditEntityForm = helper.showEditEntityForm;
      vm.hideEditEntityForm = helper.hideEditEntityForm;

      vm.newEntity = {};
      vm.showingNewEntityForm = false;
      vm.showingEditEntityForm = helper.showingEditEntityForm;
      vm.newEntityForm = null;
      vm.editEntityForm = null;
      vm.entitys = [];
      vm.entityCreateErrors = null;
      vm.entityUpdateErrors = null;

      if (response) {
        if (angular.isArray(response))
          helper.entityLoaded(response);
        else
        // error
          helper.entityLoadFailed(response);
      }
      else {
        helper.getEntitys();
      }
    }

    function Helper(_vm_, controllerOptions) {
      var helper = this;
      var vm = _vm_
      var getResources = controllerOptions.getResources;
      var beforeSubmitNewEntity = controllerOptions.beforeSubmitNewEntity;
      var beforeSubmitEditEntity = controllerOptions.beforeSubmitEditEntity;
      var beforeShowNewEntityForm = controllerOptions.beforeShowNewEntityForm;
      var beforeShowEditEntityForm = controllerOptions.beforeShowEditEntityForm;
      var getEntityDisplayName = controllerOptions.getEntityDisplayName;
      var makeEntityBody = controllerOptions.makeEntityBody;

      helper.trashEntity = function(entity, confirmDelete) {
        $log.info('destroy');
        if (angular.isUndefined(confirmDelete))
          confirmDelete = true;
        if (confirmDelete) {
          modalConfirm.confirm({
            title: 'Confirm Delete', text: 'Are you sure you want to delete "' +
            feUtils.escapeHtml(getEntityDisplayName(entity)) + '"?'
          })
            .then(function () {
              $log.info('delete confirmed');
              removeEntity(entity)
            });
        }
        else {
          removeEntity(entity)

        }
      }

      helper.submitNewEntityForm = function() {
        $log.info('submitNewEntityForm');
        var submitEntity = beforeSubmitNewEntity(vm.newEntity);
        createEntity(submitEntity);
      }

      helper.showNewEntityForm = function() {
        $log.info('showNewEntityForm');
        beforeShowNewEntityForm();
        vm.showingNewEntityForm = true;
      }

      helper.hideNewEntityForm = function() {
        $log.info('hideNewEntityForm');
        if (vm.newEntityForm) {
          vm.newEntityForm.$setPristine();
        }
        vm.showingNewEntityForm = false;
        vm.newEntity = {};
        vm.entityCreateErrors = null;

      }

      helper.submitEditEntityForm = function() {
        $log.info('submitEditEntityForm');
        var submit = beforeSubmitEditEntity(vm.editEntity);
        updateEntity(submit);
      }

      helper.showEditEntityForm = function(entity) {
        $log.info('showEditEntityForm');
        // Edit a copy, so can discard unless click Save
        vm.editEntity = angular.copy(entity);
        beforeShowEditEntityForm(entity);
      }

      helper.hideEditEntityForm = function() {
        $log.info('hideEditEntityForm');
        if (vm.editEntityForm) {
          vm.editEntityForm.$setPristine();
        }
        vm.editEntity = null;
        vm.entityUpdateErrors = null;

      }

      helper.showingEditEntityForm = function(entity) {
        return vm.editEntity && (vm.editEntity.id == entity.id);
      }

      //
      // Internal methods
      //

      helper.getEntitys = function() {
        var endWait = waitIndicator.beginWait();
        getResources().query(
          function (response) {
            endWait();
            helper.entityLoaded(response);
          },
          function (response) {
            endWait();
            helper.entityLoadFailed(response);
          }
        );
      }

      helper.entityLoaded = function(response) {
        $log.info('received data');
        vm.entitys = response;
        vm.loadingHasCompleted();
      }

      helper.entityLoadFailed = function(response) {
        $log.error('data error ' + response.status + " " + response.statusText);
        vm.loadingHasFailed(response);
      }

      function createEntity(entity) {
        var body = makeEntityBody(entity);
        var endWait = waitIndicator.beginWait();
        getResources().save(body,
          function (response) {
            $log.info('create/save');
            $log.info(response);
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
        getResources().update(key, body,
          function (response) {
            $log.info('update');
            $log.info(response);
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
        getResources().remove(key,
          function (response) {
            $log.info('remove entity');
            $log.info(response);
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
        helper.hideNewEntityForm();
        vm.entitys.splice(0, 0, entity);
        vm.entityCreateErrors = null;
      }

      function entityUpdated(entity) {
        helper.hideEditEntityForm();
        var id = entity.id;
        var found = $filter('filter')(vm.entitys, function (o) {
          return o.id === id;
        });
        if (found && found.length === 1) {
          angular.copy(entity, found[0]);
        }
        else {
          $log.error('id not found: ' + id);
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
        $log.info('entityRemoved ' + entity.id);
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
          if (angular.isDefined(errors.other))
            message = errors.other;
        }
        vm.showToastrError(message, "Delete Error");
      }

    }

  }
})();




