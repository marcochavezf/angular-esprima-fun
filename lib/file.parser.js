/**
 * Created by marcochavezf on 9/4/16.
 * Parser for general Angular structure: get possible controllers, services, directives for every file.
 */
var estraverse = require('estraverse');
var ctrlrHelper = require('./helpers/controller');
var fileHelper = require('./helpers/file');
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
		enter: enterBuildFileStructure(controllers, globalVariables, globalFunctions),
		leave: leaveBuildFileStructure
	});

	//Get controller body function/Class
  ctrlrHelper.appendControllersStructure(controllers, globalFunctions);

	return  {
		controllers: controllers,
		globalVariables: globalVariables,
		globalFunctions: globalFunctions
	}
}


var isInsideController = false;
function enterBuildFileStructure(controllers, globalVariables, globalFunctions) {
  return function(node) {

    //Check if node is controller, service, directive, global variable or global function

    if (fileHelper.isController(node)) {
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
        if (fileHelper.isVariableDeclaration(node)) {
          globalVariables.push(node)
        } else if (fileHelper.isFunctionDeclaration(node)) {
          globalFunctions.push(node)
        }
      }
    }
  }
}

function leaveBuildFileStructure(node) {
  if (fileHelper.isController(node)) {
    isInsideController = false;
  }
}
