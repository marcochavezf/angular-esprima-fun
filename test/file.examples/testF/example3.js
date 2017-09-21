/**
 * Created by marcochavezf on 9/18/17.
 */
var module = angular.module('heroApp');
module.component('counter', {
	bindings: {
		count: '='
	},
	controller: function () {
		function increment() {
			this.count++;
		}
		function decrement() {
			this.count--;
		}
		this.increment = increment;
		this.decrement = decrement;
	}
});