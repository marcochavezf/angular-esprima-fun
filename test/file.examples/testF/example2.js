/**
 * Created by marcochavezf on 9/17/17.
 */
angular.module('heroApp').component('heroDetail', {
	templateUrl: 'heroDetail.html',
	bindings: {
		hero: '='
	},
	controller: function($scope) {
		$scope.abc = 'abc';
		$scope.bcd = function(){};
		$scope.def = def;

		function def(){
		}
	}
});