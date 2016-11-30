//WARNING: Don't modify this file, otherwise update unit tests or create another file.

var varA;
var varB = 1;
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

angular.module('spicyApp1')
	.controller('AnotherController', function($scope) {

		this.asdf = 'asdf';
		this.fnA = function fnA(){};
		this.fnB = fnB;

	$scope.spice = 'very';

	$scope.chiliSpicy = function() {
		$scope.spice = 'chili';
	};

		function fnB(){}

	$scope.jalapenoSpicy = function() {
		$scope.spice = 'jalapeño';
	};

		var nanana = '';
});

angular.module('spicyApp1').controller('AnotherAnotherCtlr', AnotherAnotherCtlr);

function AnotherAnotherCtlr($scope) {
	$scope.spice = 'very';

	$scope.chiliSpicy = function() {
		$scope.spice = 'chili';
	};

	$scope.jalapenoSpicy = function() {
		$scope.spice = 'jalapeño';
	};
}

var anotherFunction = function(){
}

var anotherFunctionB = function(yikes){
}
