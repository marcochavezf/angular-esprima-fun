/**
 * Created by marcochavezf on 1/11/17.
 */
var _ = require('lodash');

module.exports = {
  isBlockStatement: isBlockStatement,
  isController: isController,
  isExportedFunction: isExportedFunction,
  isFunctionDeclaration: isFunctionDeclaration,
  isIIFE: isIIFE,
  isReturnStatement: isReturnStatement,
  isService: isService,
  isUnknowExpression: isUnknowExpression,
  isVariableDeclaration: isVariableDeclaration,
  getBodyByIdentifier: getBodyByIdentifier,
  getBodyFunction: getBodyFunction
};

function getBodyFunction(elementMeta, globalFunctions){
  var args = null;
  var bodyFunction = null;

  switch (elementMeta.node.type) {
    case "ExpressionStatement":
      args = elementMeta.node.expression.arguments;
      break;

    case "MemberExpression":
      args = elementMeta.node.object.arguments;
      break;
  }

  switch (args[1].type){
    case "ArrayExpression":
      var arrElem = args[1].elements;
      bodyFunction = arrElem[arrElem.length-1];
      break;

    case "FunctionExpression":
      bodyFunction = args[1];
      break;

    case "Identifier":
      bodyFunction =  _.find(globalFunctions, function(fn){
        return _.isEqual(args[1].name, fn.id.name)
          && _.isEqual(args[1].type, fn.id.type);
      });
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

    case "MemberExpression":
      bodyFunction =  _.find(globalFunctions, function(fn){
        return _.isEqual(args[1].property.name, fn.id.name)
          && _.isEqual(args[1].property.type, fn.id.type);
      });
      break;
  }

  return bodyFunction;
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
  return _.matches({
    "type": "ExpressionStatement",
    "expression": {
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
  return _.matches({
    "expression": {
      "type": "CallExpression",
      "callee": {
        "type": "MemberExpression",
        "computed": false,
        "property": {
          "type": "Identifier",
          "name": "factory"
        }
      }
    }
  })(node) || _.matches({
      "object": {
        "type": "CallExpression",
        "callee": {
          "type": "MemberExpression",
          "computed": false,
          "property": {
            "type": "Identifier",
            "name": "factory"
          }
        }
      }
    })(node);
}

function isReturnStatement(node){
  return _.matches({
    "type": "ReturnStatement"
  })(node);
}

function getBodyByIdentifier(nameIdentifier, cb){
  return function (node) {
    if (_.has(node.id, 'name') && node.id.name === nameIdentifier) {
      cb(node);
    }
  }
}

function isBlockStatement(node){
  return _.matches({
    "type": "BlockStatement"
  })(node);
}

