/**
 * Created by marcochavezf on 1/11/17.
 */
var _ = require('lodash');
var estraverse = require('estraverse');

module.exports = {
  isBlockStatement: isBlockStatement,
  isController: isController,
  isDirective: isDirective,
  isExportedFunction: isExportedFunction,
  isFilter: isFilter,
  isFunctionDeclaration: isFunctionDeclaration,
  isIIFE: isIIFE,
  isReturnStatement: isReturnStatement,
  isService: isService,
  isThisExpressionAssignment: isThisExpressionAssignment,
  isUnknowExpression: isUnknowExpression,
  isVariableDeclaration: isVariableDeclaration,
  getBodyByIdentifier: getBodyByIdentifier,
  getBodyFunction: getBodyFunction,
  getNodeValueFromBodyAndGlobals: getNodeValueFromBodyAndGlobals,
  getReturnStatement: getReturnStatement
};

function getBodyFunction(elementMeta, globalFunctions, globalVariables){
  var element = null;
  var bodyFunction = null;

  switch (elementMeta.node.type) {
    case "ExpressionStatement":
      element = elementMeta.node.expression.arguments[1];
      break;

    case "MemberExpression":
      element = elementMeta.node.object.arguments[1];
      break;

    default:
      element = elementMeta.node;
      break;
  }

  switch (element.type){
    case "ArrayExpression":
      var arrElem = element.elements;
      bodyFunction = arrElem[arrElem.length-1];
      break;

    case "FunctionExpression":
      bodyFunction = element;
      break;

    case "Identifier":
      bodyFunction =  _.find(globalFunctions, function(fn){
        return _.isEqual(element.name, fn.id.name)
          && _.isEqual(element.type, fn.id.type);
      });
      if (_.isNil(bodyFunction)) {

        var variableDeclarations = [];
        globalVariables.forEach((variable) => {
          variableDeclarations = variableDeclarations.concat(variable.declarations);
        });

        var fnVarDeclaration = _.find(variableDeclarations, function(varDeclaration){
          return _.isEqual(element.name, varDeclaration.id.name);
        });

        bodyFunction = getBodyFunction({ node: fnVarDeclaration.init });
      }
      break;

    case "MemberExpression":
      bodyFunction =  _.find(globalFunctions, function(fn){
        return _.isEqual(element.property.name, fn.id.name)
          && _.isEqual(element.property.type, fn.id.type);
      });
      break;

    case "CallExpression":
      if (isCallExpression(element)) {
        var bodyCallExpression = element.callee.body.body;
        var returnStatement = _.find(bodyCallExpression, { type: "ReturnStatement" });
        var functionDeclaration = _.find(bodyCallExpression, (bodyElement) => {
          return isFunctionDeclaration(bodyElement) && bodyElement.id.name === returnStatement.argument.name;
        });
        bodyFunction = functionDeclaration;
      }
      break;
  }

  return bodyFunction;
}

function matchesComponent({ node, valueIdentifier }){
  function matchesServiceBody(ast){
    return matches({
      "type": "CallExpression",
      "callee": {
        "type": "MemberExpression",
        "computed": false,
        "property": {
          "type": "Identifier",
          "name": valueIdentifier
        }
      }
    })(ast)
  }

  return matches({
      "expression": matchesServiceBody
    })(node)
    || matches({
      "object": matchesServiceBody
    })(node);
}

function isCallExpression(node){
  return _.matches({
    "type": "CallExpression",
    "callee": {
      "type": "FunctionExpression",
      "id": null,
      "body": {
        "type": "BlockStatement"
      }
    }
  })(node);
}

function isController(node) {
  return matchesComponent({ node, valueIdentifier: "controller" });
}

function isFunctionDeclaration(node) {
  return _.matches({
    "type": "FunctionDeclaration"
  })(node);
}

function isVariableDeclaration(node) {
  return _.matches({
    "type": "VariableDeclaration",
    "kind": "var"
  })(node);
}

function isIIFE(node){
  return _.matches({
    "type": "Program",
    "body": [
      {
        "type": "ExpressionStatement",
        "expression": {
          "type": "CallExpression",
          "callee": {
            "type": "FunctionExpression",
            "id": null,
            "params": [],
            "body": {
              "type": "BlockStatement"
            }
          },
          "arguments": []
        }
      }
    ]
  })(node);
}

function isUnknowExpression(node){
  return matches({
    "expression": {
      "arguments" : (args) =>  _.isArray(args) && args.length === 2,
      "type": "CallExpression",
      "callee": {
        "type": "MemberExpression",
        "object": {
          "type": "CallExpression"
        },
        "property": {
          "type": "Identifier"
        }
      }
    }
  })(node);
}

function isExportedFunction(node){
  return _.matches({
    "type": "Program",
    "body": [
      {
        "type": "ExportNamedDeclaration",
        "declaration": {
          "type": "FunctionDeclaration",
          "id": {
            "type": "Identifier"
          }
        }
      }
    ]
  })(node);
}

function isService(node) {
  return matchesComponent({
    node,
    valueIdentifier: (identifier) => (identifier === "factory" || identifier === "service")
  });
}

function isFilter(node) {
  return matchesComponent({
    node,
    valueIdentifier: 'filter'
  });
}

function isDirective(node) {
  return matchesComponent({
    node,
    valueIdentifier: 'directive'
  });
}

function isReturnStatement(node){
  return _.matches({
    "type": "ReturnStatement"
  })(node);
}

function getNodeByIdentifier(bodyToAnalize, nameIdentifier){
  var functionData = {
    functionMeta: null,
    function: null
  };
  estraverse.traverse(bodyToAnalize, {
    enter: getBodyByIdentifier(nameIdentifier, function(functionBody){
      functionData.functionMeta = functionBody;
      functionData.function = functionBody.init || functionBody;
    })
  });
  return functionData;
}

function getBodyByIdentifier(nameIdentifier, cb){
  return function (node) {
    if (_.has(node.id, 'name') && node.id.name === nameIdentifier) {
      cb(node);
    }
  }
}

function getNodeValueFromBodyAndGlobals({ nodeIdentifier, bodyToAnalize, globalFunctions, globalVariables }){
  switch (nodeIdentifier.type) {

    case 'Identifier':
      var functionData = getNodeByIdentifier(bodyToAnalize, nodeIdentifier.name);

      //if node is not contained in body, then look for function in global functions (just in case if the node value is a function).
      if (_.isNil(functionData.function)){
        return getBodyFunction({ node: nodeIdentifier }, globalFunctions, globalVariables);
      }

      return functionData.function;

    case 'FunctionExpression':
    case 'ObjectExpression':
      return nodeIdentifier;

    case 'ArrayExpression':
      var arrElem = nodeIdentifier.elements;
      return arrElem[arrElem.length-1];

    default:
      throw new Error('Special type from nodeIdentifier in getNodeValueFromBodyAndGlobals: ' + nodeIdentifier.type);
  }
}

function isBlockStatement(node){
  return _.matches({
    "type": "BlockStatement"
  })(node);
}

function isThisExpressionAssignment(node){
  return _.matches({
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

function getReturnStatement({ elementFunction }){
  var returnStatement = null;
  estraverse.traverse(elementFunction.body, {
    enter: function(node) {
      if (isReturnStatement(node)) {
        returnStatement = node;
        return this.break();
      }

      if (!isBlockStatement(node)) {
        this.skip();
      }
    }
  });

  if (returnStatement) {

    //Check if it's just an identifier, then search for the return body (returnArgument).
    var typeOfReturnStatement = returnStatement.argument.type;
    if (typeOfReturnStatement === 'Identifier') {
      estraverse.traverse(elementFunction.body, {
        enter: getBodyByIdentifier(returnStatement.argument.name, function(returnArgument){
          //TODO: maybe we can store returnArgument in another property in order to keep the original one.
          returnStatement.argument = returnArgument.init || returnArgument;
        })
      });
    }

  }

  return returnStatement;
}

function matches(pattern) {
  return (ast) => {
    return _.isMatchWith(ast, pattern, (value, matcher) => {
      // When comparing against function, execute the function
      if (typeof matcher === 'function') {
        return matcher(value);
      }
      // Otherwise fall back to built-in comparison logic
    });
  };
}
