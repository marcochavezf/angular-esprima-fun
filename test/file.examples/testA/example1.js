var myApp = angular.module('spicyApp1', []);

myApp.controller('SpicyController', ['$scope', function($scope, MobileConfig) {
	var fnB = function(){}

	$scope.fnA = fnA;
	$scope.model = {
		asd: 'asd'
	};
	$scope.valFn = valFn();
	$scope.isAdmin = !MobileConfig.isDevice();
	$scope.arr = [];

	function valFn(){

	}

	$scope.spice = 'very';

	var nonono = true;

	$scope.chiliSpicy = function() {
		$scope.spice = 'chili';
	};

	$scope.jalapenoSpicy = function() {
		$scope.spice = 'jalapeño';
	};

	function fnA(){
	}


}]);
