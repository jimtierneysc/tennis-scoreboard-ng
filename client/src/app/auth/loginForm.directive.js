/**
 * @ngdoc directive
 * @name feLoginForm
 * @description
 * Form for login
 *
 * @example:
 <fe-login-form></fe-login-form>
 */


(function () {
  'use strict';

  angular
    .module('frontend')
    .directive('feLoginForm', directiveFunc);

  /** @ngInject */
  function directiveFunc() {
    var directive = {
      restrict: 'EA',
      templateUrl: 'app/auth/loginForm.html',
      controller: LoginController,
      controllerAs: 'vm'
    };

    return directive;
  }


  /** @ngInject */
  function LoginController($state, $location, loginResource, authenticationService, errorsHelper, waitIndicator, $log) {
    var vm = this;

    activate();

    function activate() {
      vm.entity = {username: "", password: ""};
      vm.errors = {};
      vm.submit = submit;

      errorsHelper.activate(vm,
        {
          'username': null,
          'password': null
        });
    }

    function submit() {
      updateEntity(vm.entity);
    }

    function updateEntity(entity) {
      var body = {
        session: {
          username: vm.entity.username,
          password: vm.entity.password
        }
      };
      var endWait = waitIndicator.beginWait();
      loginResource.getLogin().login(body,
        function (response) {
          $log.info('login');
          $log.info(response);
          endWait();
          var updatedEntity = angular.copy(entity);
          angular.merge(updatedEntity, response);
          entityUpdated(updatedEntity);
        },
        function (response) {
          $log.error('auth error ' + response.status + " " + response.statusText);
          endWait();
          entityUpdateError(entity, response);
        }
      );
    }

    function entityUpdateError(entity, response) {
      vm.errors = vm.errorsOfResponse(response);
    }

    function entityUpdated(entity) {
      authenticationService.setCredentials(entity.username, entity.auth_token);
    }

  }


})();
