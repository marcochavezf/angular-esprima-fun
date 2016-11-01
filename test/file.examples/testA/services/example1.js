/**
 * Created by marcochavezf on 10/31/16.
 */
var myModule = angular.module('myModule', []);
myModule.factory('serviceA', function() {
  var shinyNewServiceInstance;
  // factory function body that constructs shinyNewServiceInstance
  return shinyNewServiceInstance;
});

myModule.factory('serviceB', function(abc, bcd) {
  function sdfg(){

  }
  var asdf = 123;
  var chilli = function chilli(){}
  var anotherChilli = function(){}
  
  // factory function body that constructs shinyNewServiceInstance
  return {
    sdfg: sdfg,
    asdf: asdf,
    abc: abc,
    bcd: bcd.efg,
    xyz: bcd.fn(),
    chilli: chilli,
    anotherChilli: anotherChilli,
    jalapeno: jalapeno
  };
  
  function jalapeno(){}
});
