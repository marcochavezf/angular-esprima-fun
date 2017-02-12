/**
 * Created by marcochavezf on 2/11/17.
 */
angular.module('moduleTest')
.service('MyService', function () {
  this.anotherFunction = anotherFunction;
  
  function anotherFunction(){

  }

  this.sayHello = function () {
    console.log('hello');
  };
});
