/**
 * Created by marcochavezf on 9/4/16.
 */
var estraverse = require('estraverse');
var _ = require('lodash');
var fileHelper = require('./file');

module.exports = {
  appendControllersStructure: appendControllersStructure
};

function appendControllersStructure(controllers, globalFunctions){
  for (var i=0; i<controllers.length; i++){
    var controllerMeta = controllers[i];
    var ctrlrFunction = getControllerFunction(controllerMeta, globalFunctions);
    controllerMeta.function = ctrlrFunction;

    //Traverse controller body
    //console.log('********** BEGIN Controller ' + controllerMeta.name + ' ****************');
    estraverse.traverse(ctrlrFunction.body, { enter: enterBuildControllerStructure(controllerMeta) });

    //Identify scope properties (name, assignee) and scope functions (name, functionCode)
    controllerMeta.scopeFunctions = [];
    controllerMeta.scopeProperties = [];
    addPropertiesAndFunctions(controllerMeta.scopeFunctions, controllerMeta.scopeProperties, controllerMeta.scopeAssignments, controllerMeta);
    //Sort alphabetically
    controllerMeta.scopeFunctions.sort((elemA, elemB)=>{ return elemA.name > elemB.name });
    controllerMeta.scopeProperties.sort((elemA, elemB)=>{ return elemA.name > elemB.name });

    //Identify 'this' properties (name, assignee) and 'this' functions (name, functionCode)
    controllerMeta.thisFunctions = [];
    controllerMeta.thisProperties = [];
    addPropertiesAndFunctions(controllerMeta.thisFunctions, controllerMeta.thisProperties, controllerMeta.thisAssignments, controllerMeta);
    //Sort alphabetically
    controllerMeta.thisFunctions.sort((elemA, elemB)=>{ return elemA.name > elemB.name });
    controllerMeta.thisProperties.sort((elemA, elemB)=>{ return elemA.name > elemB.name });
    //console.log('********** END Controller ' + controllerMeta.name + ' ****************');
  }
}

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
  var ctrlrFunction = null;

	switch (args[1].type){
		case "ArrayExpression":
			var arrElem = args[1].elements;
      ctrlrFunction = arrElem[arrElem.length-1];
			break;

		case "FunctionExpression":
      ctrlrFunction = args[1];
			break;

		case "Identifier":
      ctrlrFunction =  _.find(globalFunctions, function(fn){
				return _.isEqual(args[1].name, fn.id.name)
            && _.isEqual(args[1].type, fn.id.type);
			});
			if (_.isUndefined(ctrlrFunction)){
				return new Error('Function Controller ' + args[1].name + ' is not found')
			}
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

	return ctrlrFunction;
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
		if (fileHelper.isVariableDeclaration(node)){
      variableDeclarations.push(node);
		}

		//Capture Function Declarations
		if (fileHelper.isFunctionDeclaration(node)){
      functionDeclarations.push(node);
		}
	}
}

