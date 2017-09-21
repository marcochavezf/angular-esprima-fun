/**
 * Created by marcochavezf on 9/18/17.
 */
angular.module('myApp')
.component('groupComponent', {
	templateUrl: 'app/components/group.html',
	controller: GroupController,
	controllerAs: 'GroupCtrl',
	bindings: {
		input: '<'
	}
});

function GroupController() {
	this.innerProp = "inner";
}