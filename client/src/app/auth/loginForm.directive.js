/**
 * @ngdoc directive
 * @name feLoginForm
 * @description
 * Form for login
 *
 */


(function () {
  'use strict';

  angular
    .module('frontendAuth')
    .directive('feLoginForm', directive);

  /** @ngInject */
  function directive() {
    var directive = {
      restrict: 'E',
      templateUrl: 'app/auth/loginForm.html',
      controller: Controller,
      controllerAs: 'vm'
    };

    return directive;
  }


  /** @ngInject */
  function Controller(sessionResource, userCredentials, errorsHelper, waitIndicator, $log) {
    var vm = this;

    activate();

    function activate() {
      vm.entity = {username: "", password: ""};
      vm.errors = {};
      vm.submit = submit;

      errorsHelper(vm,
        {
          names: [
            'username',
            'password'
          ]
        });
    }

    function submit() {
      updateEntity();
    }

    function updateEntity() {
      var body = {
        session: {
          username: vm.entity.username,
          password: vm.entity.password
        }
      };
      sessionResource.getSession().login(body,
        function (response) {
          userCredentials.setCredentials(response.username, response.auth_token);
        },
        function (response) {
          $log.error('auth error ' + response.status + " " + response.statusText);
          vm.errors = vm.errorsOfResponse(response);
        }
      );
    }
  }
})();
