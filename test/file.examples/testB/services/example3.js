/**
 * Created by marcochavezf on 10/31/16.
 */
'use strict';
/**
 * Created by marcochavezf on 12/9/15.
 */

angular.module('PideUnKangouApp')
  .factory('customStorage', function(localStorageService, ENV) {
    var getLocalData = function(key){
      return JSON.parse(localStorageService.get(key));
    };
    var saveLocalData = function(key, data){
      localStorageService.set(key, JSON.stringify(data));
    };
    var removeLocalData = function(key){
      localStorageService.remove(key);
    };
    var appStorage = {
      getUser: function(){
        return getLocalData(ENV.localStorage.user);
      },
      saveUser: function(currentUser){
        saveLocalData(ENV.localStorage.user, currentUser);
      },
      removeUser: function(){
        removeLocalData(ENV.localStorage.user);
      },
      getModel: function(){
        return getLocalData(ENV.localStorage.model);
      },
      saveModel: function(model){
        saveLocalData(ENV.localStorage.model, model);
      },
      resetModel: function(){
        var defaultModel = {
          pickup: {},
          dropoff: {},
          customer: {},
          price: {},
          items: '',
          promocode: ''
        };
        saveLocalData(ENV.localStorage.model, defaultModel);
        return defaultModel;
      },
      getToken: function(){
        return getLocalData(ENV.localStorage.token);
      },
      saveToken: function(token){
        saveLocalData(ENV.localStorage.token, token);
      },
      removeToken: function(){
        removeLocalData(ENV.localStorage.token);
      }
    };
    return appStorage;
  });
