/**
 * @ngdoc service
 * @name scoreBoardResource
 * @description
 * Service to transfer match score board JSON between frontend and backend
 *
 */
(function() {
  'use strict';

  angular
    .module('frontend')
    .factory('scoreBoardResource', serviceFunc);

  /** @ngInject */
  function serviceFunc($log, $resource, baseURL) {
    var path = baseURL + 'match_score_board';

    var service = {
      path: path,
      getScoreBoard: get
    };

    return service;

    function get() {
      $log.info("get match score board");
      return $resource(path + '/:id', null, {'update': {method: 'POST'}});
    }


  }
})();
