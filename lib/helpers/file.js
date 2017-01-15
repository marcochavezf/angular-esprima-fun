/**
 * Created by marcochavezf on 1/11/17.
 */
var _ = require('lodash');

module.exports = {
  isController: isController,
  isFunctionDeclaration: isFunctionDeclaration,
  isVariableDeclaration: isVariableDeclaration
};

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
