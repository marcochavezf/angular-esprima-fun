/**
 * Created by marcochavezf on 9/4/16.
 * Parser for general Angular structure: get possible controllers, services, directives for every file.
 */
var estraverse = require('estraverse');
var ctrlrHelper = require('./helpers/controller');
var serviceHelper = require('./helpers/service');
var fileHelper = require('./helpers/file');
var _ = require('lodash');

module.exports = {
  appendGlobalFunctions: appendGlobalFunctions,
  parse: parse
};

function appendGlobalFunctions({ controllers, services, globalFunctions }){
  //Append controller body function/Class
  ctrlrHelper.appendControllersStructure(controllers, globalFunctions);

  //Append Service structure (service body function/class)
  serviceHelper.appendServiceStructure(services, globalFunctions);

  return  {
    controllers: controllers,
    services: services
  }
}

function parse(ast){

	var controllers = []; // { node, name, body }
  var services = []; // { node, name, body }
  var globalVariables = [];
	var globalFunctions = [];
  /* variables or functions with scope at the same level of controllers, services, etc.
   * but aren't not in the global scope (inside of IFFE). */
  var localFileVariables = [];
  var localFileFunctions = [];

	// Get node controllers, global variables and functions
	estraverse.traverse(ast, {
		enter: enterBuildFileStructure({ controllers, services, globalVariables, globalFunctions, localFileVariables, localFileFunctions }),
		leave: leaveBuildFileStructure
	});

  var externalFunctions = globalFunctions.concat(localFileFunctions);

  appendGlobalFunctions({
    controllers,
    services,
    globalFunctions: externalFunctions
  });

	return  {
		controllers: controllers,
    services: services,
		globalVariables: globalVariables,
		globalFunctions: globalFunctions
	}
}

var isInsideIFFE = false;

function enterBuildFileStructure({ controllers, services, globalVariables, globalFunctions, localFileVariables, localFileFunctions }) {
  return function(node) {
    var args = null;

    //Check if node is controller, service, directive, global variable or global function
    if (fileHelper.isController(node)) {
      switch (node.type) {
        case "ExpressionStatement":
          args = node.expression.arguments;
          break;

        case "MemberExpression":
          args = node.object.arguments;
          break;
      }
      var controller = {
        node: node,
        name: args[0].value
      };
      controllers.push(controller);
      this.skip();

    } else
    if (fileHelper.isService(node)) {
      switch (node.type) {
        case "ExpressionStatement":
          args = node.expression.arguments;
          break;

        case "MemberExpression":
          args = node.object.arguments;
          break;
      }
      var service = {
        node: node,
        name: args[0].value
      };
      services.push(service);
      this.skip();

    } else
    if (fileHelper.isIIFE(node)) {
      isInsideIFFE = true;

    } else
    if (fileHelper.isIIFE(node)) {
      isInsideIFFE = true;

    } else
    if (isInsideIFFE) {

      if (fileHelper.isVariableDeclaration(node)) {
        localFileVariables.push(node);
        this.skip();

      } else if (fileHelper.isFunctionDeclaration(node)) {
        localFileFunctions.push(node);
        this.skip();
      }

    } else
    if (fileHelper.isUnknowExpression(node)){
      //TODO: use this expression to ignore/skip unsupported expressions (only use it at the end of other expression comparisons).
      //this.skip();

    } else {

      if (fileHelper.isVariableDeclaration(node)) {
        globalVariables.push(node);
        this.skip();

      } else if (fileHelper.isFunctionDeclaration(node)) {
        globalFunctions.push(node);
        this.skip();

      }

    }
  }
}

function leaveBuildFileStructure(node) {
  if (fileHelper.isIIFE(node)) {
    isInsideIFFE = false;
  }
}
