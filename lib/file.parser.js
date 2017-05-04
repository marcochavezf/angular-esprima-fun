/**
 * Created by marcochavezf on 9/4/16.
 * Parser for general Angular structure: get possible controllers, services, directives for every file.
 */
var estraverse = require('estraverse');
var directiveHelper = require('./helpers/directive');
var serviceHelper = require('./helpers/service');
var filterHelper = require('./helpers/filter');
var ctrlrHelper = require('./helpers/controller');
var fileHelper = require('./helpers/file');
var _ = require('lodash');

module.exports = {
  appendGlobalFunctions: appendGlobalFunctions,
  getSemanticsFromFilesParsed: getSemanticsFromFilesParsed,
  parse: parse
};

function appendGlobalFunctions({ controllers, directives, services, filters, globalFunctions, globalVariables }){
  //Append controller body function/Class
  ctrlrHelper.appendControllersStructure(controllers, globalFunctions, globalVariables);

  //Append Service/Factory structure (service body function/class)
  serviceHelper.appendServiceStructure(services, globalFunctions, globalVariables);

  //Append Filter structure (filter body function/class)
  filterHelper.appendFilterStructure(filters, globalFunctions, globalVariables);

  //Append Directive structure (directive body function/class)
  directiveHelper.appendDirectiveStructure(directives, globalFunctions, globalVariables);

  return  {
    controllers: controllers,
    directives: directives,
    services: services,
    filters: filters
  }
}

function getSemanticsFromFilesParsed(filesParsed, type) {
  var semantics = _.reduce(filesParsed, function(accum, fileParsed){
    var elements = _.map(fileParsed.fileSemantic[type], function(element){
      element.pathFile = fileParsed.pathFile;
      return element;
    });
    return accum.concat(elements)
  }, []);
  return semantics;
}

function parse(ast){

	var controllers = []; // { node, name, body }
  var directives = [];
  var services = []; // { node, name, body }
  var filters = [];
  var globalVariables = [];
	var globalFunctions = [];
  /* variables or functions with scope at the same level of controllers, services, etc.
   * but aren't not in the global scope (inside of IFFE). */
  var localFileVariables = [];
  var localFileFunctions = [];

	// Get node controllers, global variables and functions
	estraverse.traverse(ast, {
		enter: enterBuildFileStructure({ controllers, directives, services, filters, globalVariables, globalFunctions, localFileVariables, localFileFunctions }),
		leave: leaveBuildFileStructure
	});

  var externalFunctions = globalFunctions.concat(localFileFunctions);
  var externalVariables = globalVariables.concat(localFileVariables);

  appendGlobalFunctions({
    controllers,
    directives,
    services,
    filters,
    globalFunctions: externalFunctions,
    globalVariables: externalVariables
  });

	return  {
		controllers: controllers,
    directives: directives,
    services: services,
    filters: filters,
		globalVariables: globalVariables,
		globalFunctions: globalFunctions
	}
}

var isInsideIFFE = false;
var nestedBlockStatements = 0;

function getNameFromNode(node){
  var args = null;
  switch (node.type) {
    case "ExpressionStatement":
      args = node.expression.arguments;
      break;

    case "MemberExpression":
      args = node.object.arguments;
      break;
  }
  return _.isEmpty(args) ? null : args[0].value;
}

function enterBuildFileStructure({ controllers, directives, services, filters, globalVariables, globalFunctions, localFileVariables, localFileFunctions }) {
  return function(node) {

    //Check if node is controller, service, directive, global variable or global function
    var nodeName = getNameFromNode(node);
    if (fileHelper.isController(node)) {
      var controller = {
        node: node,
        name: nodeName
      };
      if (nodeName) {
        controllers.push(controller);
        this.skip();
      }

    } else
    if (fileHelper.isService(node)) {
      var service = {
        node: node,
        name: nodeName
      };
      if (nodeName) {
        services.push(service);
        this.skip();
      }

    } else
    if (fileHelper.isFilter(node)) {
      var filter = {
        node: node,
        name: nodeName
      };
      if (nodeName) {
        filters.push(filter);
        this.skip();
      }

    } else
    if (fileHelper.isDirective(node)) {
      var directive = {
        node: node,
        name: nodeName
      };
      if (nodeName) {
        directives.push(directive);
        this.skip();
      }

    } else
    if (fileHelper.isIIFE(node)) {
      isInsideIFFE = true;

    } else
    if (fileHelper.isBlockStatement(node)) {
      nestedBlockStatements++;

    } else
    if (isInsideIFFE || nestedBlockStatements > 0) {

      if (fileHelper.isVariableDeclaration(node)) {
        localFileVariables.push(node);
        this.skip();

      } else if (fileHelper.isFunctionDeclaration(node)) {
        localFileFunctions.push(node);
        this.skip();
      }

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
  if (fileHelper.isBlockStatement(node)) {
    nestedBlockStatements--;
  }
}
