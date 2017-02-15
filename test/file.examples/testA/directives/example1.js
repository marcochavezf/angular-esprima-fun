/**
 * Created by marcochavezf on 2/13/17.
 */
var app = angular.module('myapp', []);

app.directive('helloWorld', function() {
  return {
    restrict: 'AE',
    replace: 'true',
    template: '<h3>Hello World!!</h3>'
  };
});
