/**
 * Created by marcochavezf on 9/18/17.
 */
var GroupController = function () {
	this.innerProp = "inner";
}

angular.module('myApp')
.component('groupComponent2', {
	templateUrl: 'app/components/group.html',
	controller: GroupController,
	controllerAs: 'GroupCtrl',
	bindings: {
		input: '<'
	}
});