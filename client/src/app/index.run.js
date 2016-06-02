(function() {
  'use strict';

  angular
    .module('frontend')
    .run(runBlock);

  /** @ngInject */
  function runBlock($log) {

    $log.debug('runBlock end');

      // // Monitor uirouter state change
      // $rootScope
      //   .$on('$stateChangeStart',
      //     function(event, toState, toParams, fromState, fromParams){
      //       $log.info('stateChangeStart');
      //     });
      //
      // $rootScope
      //   .$on('$stateChangeSuccess',
      //     function(event, toState, toParams, fromState, fromParams){
      //       $log.info('stateChangeEnd');
      //     });

  }

})();
