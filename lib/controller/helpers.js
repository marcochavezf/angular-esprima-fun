/**
 * Created by marcochavezf on 9/4/16.
 */
var _ = require('lodash');

module.exports = {
	addPropertiesAndFunctions: addPropertiesAndFunctions,
	enterBuildControllersAndGlobals: enterBuildControllersAndGlobals,
	enterBuildControllerStructure: enterBuildControllerStructure,
	getControllerFunction: getControllerFunction,
	leaveBuildControllersAndGlobals: leaveBuildControllersAndGlobals
};

function addPropertiesAndFunctions(functions, properties, assignments, controllerMeta){
	assignments.forEach(function(scopeAssignment){
		var scopeName = scopeAssignment.expression.left.property.name;
		var typeAssignment = scopeAssignment.expression.right.type;

		switch (typeAssignment) {
			case 'Identifier':
				//Scope Function
				if (hasBeenAssigned(functions, scopeName)) {
					return;
				}

				var functionDeclaration = _.find(controllerMeta.functionDeclarations, function(functionDeclaration){
          return _.isEqual(functionDeclaration.id.name, scopeAssignment.expression.right.name)
              && _.isEqual(functionDeclaration.id.type, scopeAssignment.expression.right.type);
				});

				if (_.isUndefined(functionDeclaration)){
					return new Error('Function Declaration ' + scopeAssignment.expression.right.name + ' is not found')
				}

				var scopeFunction = {
					node: scopeAssignment,
					name: scopeName,
					function: functionDeclaration
				};
				functions.push(scopeFunction);
				break;

			case 'FunctionExpression':
				//Scope Function
				if (hasBeenAssigned(functions, scopeName)) {
					return;
				}

				var scopeFunction = {
					node: scopeAssignment,
					name: scopeName,
					function: scopeAssignment.expression.right
				};
				functions.push(scopeFunction);
				break;

			default: //there are different types of properties (Literal, ObjectExpression, UnaryExpression, etc.)
				//Scope Property
				if (hasBeenAssigned(properties, scopeName)) {
					return;
				}
				var scopeProperty = {
					node: scopeAssignment,
					name: scopeName,
					value: scopeAssignment.expression.right.value,
					properties: scopeAssignment.expression.right.properties,
					type: scopeAssignment.expression.right.type
				};
				properties.push(scopeProperty);
				break;
		}
	});
}

function hasBeenAssigned(collection, name){
	var existingScopeAssignment = _.find(collection, (scopeAssignment)=>{
		return scopeAssignment.name === name;
	});

	if (!_.isUndefined(existingScopeAssignment)) {
		//console.warn('Existing Scope Assignment ' + name + ', ignoring last scope assignment');
		return true;
	} else {
		return false;
	}
}


function isThisAssignment(node){
	return _.matches({
		"type": "ExpressionStatement",
		"expression": {
			"type": "AssignmentExpression",
			"operator": "=",
			"left": {
				"type": "MemberExpression",
				"computed": false,
				"object": {
					"type": "ThisExpression"
				}
			}
		}
	})(node);
}

function isScopeAssignment(node){
	return _.matches({
		"type": "ExpressionStatement",
		"expression": {
			"type": "AssignmentExpression",
			"operator": "=",
			"left": {
				"type": "MemberExpression",
				"computed": false,
				"object": {
					"type": "Identifier",
					"name": "$scope"
				}
			}
		}
	})(node);
}

function getControllerFunction(controller, globalFunctions){
	var args = controller.node.expression.arguments;

	switch (args[1].type){
		case "ArrayExpression":
			var arrElem = args[1].elements;
			controller.function = arrElem[arrElem.length-1];
			break;

		case "FunctionExpression":
			controller.function = args[1];
			break;

		case "Identifier":
			var fnCtlr =  _.find(globalFunctions, function(fn){
				return _.isEqual(args[1].name, fn.id.name)
            && _.isEqual(args[1].type, fn.id.type);
			});
			if (_.isUndefined(fnCtlr)){
				return new Error('Function Controller ' + args[1].name + ' is not found')
			}
			controller.function = fnCtlr;
			//TODO: check global variables?
			/*
			 globalVariables.forEach(function(variable){
			 var init = variable.declarations[0].init;
			 if (init && init.type === "FunctionExpression"){
			 console.log(JSON.stringify(init, null, 2));
			 }
			 });
			 */
			break;
	}

	return controller.function;
}


function enterBuildControllerStructure(controller){

	var scopeAssignments = []; //Variables and Functions that belong to '$scope' object
	var thisAssignments = []; //Variables and Functions that belong to 'this' object
	var variableDeclarations = [];
	var functionDeclarations = [];

	controller.scopeAssignments = scopeAssignments;
	controller.thisAssignments = thisAssignments;
	controller.variableDeclarations = variableDeclarations;
	controller.functionDeclarations = functionDeclarations;

	return function(node){
		//Capture $scope assignments from controller
		if (isScopeAssignment(node)) {
      //console.log('scope assignemnt:',node.expression.left.property.name);
			scopeAssignments.push(node);
		}

		//Capture this assignments from controller
		if (isThisAssignment(node)){
			thisAssignments.push(node);
		}

		//Capture Variable Declaration
		if (isVariableDeclaration(node)){
      variableDeclarations.push(node);
		}

		//Capture Function Declarations
		if (isFunctionDeclaration(node)){
      functionDeclarations.push(node);
		}
	}
}

var isInsideController = false;
function enterBuildControllersAndGlobals(controllers, globalVariables, globalFunctions) {

	return function(node) {

		if (isController(node)) {
			var controller = {
				node: node,
				name: node.expression.arguments[0].value
			};
			controllers.push(controller);
			//console.log('*********** controller ' +  controllers.length + ' *************');
			//console.log(JSON.stringify(node, null, 2));
			isInsideController = true;
		} else {

			if (!isInsideController) {
				if (isVariableDeclaration(node)) {
					globalVariables.push(node)
				} else if (isFunctionDeclaration(node)) {
					globalFunctions.push(node)
				}
			}
		}
	}
}

function leaveBuildControllersAndGlobals(node) {
	if (isController(node)) {
		isInsideController = false;
	}
}

function isController(node) {
	return _.matches({
		"type": "ExpressionStatement",
		"expression": {
			"type": "CallExpression",
			"callee": {
				"type": "MemberExpression",
				"computed": false,
				"property": {
					"type": "Identifier",
					"name": "controller"
				}
			}
		}
	})(node);
}

function isVariableDeclaration(node) {
	return _.matches({
		"type": "VariableDeclaration",
		"kind": "var"
	})(node);
}

function isFunctionDeclaration(node) {
	return _.matches({
		"type": "FunctionDeclaration"
	})(node);
}
