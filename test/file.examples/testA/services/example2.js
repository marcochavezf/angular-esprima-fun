/**
 * Created by marcochavezf on 10/31/16.
 */
/**
 * NameService Factory
 * Brief description
 */
(function(){
  'use strict';

  angular.module('nameModule')
    .factory('nameService', nameService);

  /* @ngInject */
  function nameService($http, $log, $q){

    var service = {
      getData: getData
    };

    return service;

    ////////////

    /**
     * @name getData
     * @desc Brief description
     */
    function getData() {
      return $http.get('/api/endpoint')
        .then(getDataComplete)
        .catch(getDataFailed);

      function getDataComplete(res) {
        return res.data;
      }

      function getDataFailed(e) {
        var newMessage = 'XHR Failed for getDataComplete';
        if (e.data && e.data.description) {
          newMessage = newMessage + '\n' + e.data.description;
        }
        e.data.description = newMessage;
        $log.error(newMessage);
        return $q.reject(e);
      }
    }
  }

})();
