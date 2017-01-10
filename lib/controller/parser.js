/**
 * Created by marcochavezf on 9/4/16.
 */
var estraverse = require('estraverse');
var ctrlrHelpers = require('./helpers');
var _ = require('lodash');

module.exports = {
	parse: parse
};

function parse(ast){

	var controllers = []; // { node, name, body }
	var globalVariables = [];
	var globalFunctions = [];

	// Get node controllers, global variables and functions
	estraverse.traverse(ast, {
		enter: ctrlrHelpers.enterBuildControllersAndGlobals(controllers, globalVariables, globalFunctions),
		leave: ctrlrHelpers.leaveBuildControllersAndGlobals
	});

	//Get controller body function/Class
	for (var i=0; i<controllers.length; i++){
		var controllerMeta = controllers[i];
    var ctrlrFunction = ctrlrHelpers.getControllerFunction(controllerMeta, globalFunctions);
    controllerMeta.function = ctrlrFunction;

		//Traverse controller body
		//console.log('********** BEGIN Controller ' + controllerMeta.name + ' ****************');
		estraverse.traverse(ctrlrFunction.body, { enter: ctrlrHelpers.enterBuildControllerStructure(controllerMeta) });

		//Identify scope properties (name, assignee) and scope functions (name, functionCode)
		controllerMeta.scopeFunctions = [];
		controllerMeta.scopeProperties = [];
		ctrlrHelpers.addPropertiesAndFunctions(controllerMeta.scopeFunctions, controllerMeta.scopeProperties, controllerMeta.scopeAssignments, controllerMeta);
		//Sort alphabetically
		controllerMeta.scopeFunctions.sort((elemA, elemB)=>{ return elemA.name > elemB.name });
		controllerMeta.scopeProperties.sort((elemA, elemB)=>{ return elemA.name > elemB.name });

		//Identify 'this' properties (name, assignee) and 'this' functions (name, functionCode)
		controllerMeta.thisFunctions = [];
		controllerMeta.thisProperties = [];
		ctrlrHelpers.addPropertiesAndFunctions(controllerMeta.thisFunctions, controllerMeta.thisProperties, controllerMeta.thisAssignments, controllerMeta);
		//Sort alphabetically
		controllerMeta.thisFunctions.sort((elemA, elemB)=>{ return elemA.name > elemB.name });
		controllerMeta.thisProperties.sort((elemA, elemB)=>{ return elemA.name > elemB.name });
		//console.log('********** END Controller ' + controllerMeta.name + ' ****************');
	}

	return  {
		controllers: controllers,
		globalVariables: globalVariables,
		globalFunctions: globalFunctions
	}
}
