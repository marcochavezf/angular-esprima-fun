/**
 * Created by marcochavezf on 9/4/16.
 */
var estraverse = require('estraverse');
var _ = require('lodash');
var fileHelper = require('./file');

module.exports = {
  appendServiceStructure: appendServiceStructure
};

function appendServiceStructure(services, globalFunctions, globalVariables){
  for (var i=0; i<services.length; i++){
    var serviceMeta = services[i];
    if (!_.isNil(serviceMeta.function)){
      //This file has its function appended so we avoid to create structure again.
      continue;
    }

    serviceMeta.function = fileHelper.getBodyFunction(serviceMeta, globalFunctions, globalVariables);
    if (_.isNil(serviceMeta.function)){
      //This file doesn't contain the service body, we could check again but when all files has been parsed.
      continue;
    }

    serviceMeta.returnStatement = fileHelper.getReturnStatement({ elementFunction: serviceMeta.function });
    if (_.isNil(serviceMeta.returnStatement)) {
      ////// Angular Service (angular "service" doens't have returnStatement)
      //If returnStatement doesn't exist then search for each "ThisExpression" and accumulate them all as 'returnStatement'.
      estraverse.traverse(serviceMeta.function.body, { enter: getThisExpressionsAccumulated(serviceMeta) });
    }

    //Search for each returnBody property and append it to serviceMeta as 'properties'.
    _.each(serviceMeta.returnStatement.argument.properties, function (returnProperty) {
      var returnPropertyValue = returnProperty.value || returnProperty.expression.right;
      if (returnPropertyValue.type === 'Identifier') {
        estraverse.traverse(serviceMeta.function.body, {
          enter: fileHelper.getBodyByIdentifier(returnPropertyValue.name, function (bodyProperty) {
            //TODO: maybe we can store returnArgument in another property in order to keep the original one.
            returnProperty.value = bodyProperty;
          })
        });
      }

      if (returnProperty.key) {
        if (_.isNil(returnProperty.key.name)) {
          returnProperty.key.name = returnProperty.key.value;
        }
      }

      if (returnProperty.expression) {
        if (returnPropertyValue.type === 'FunctionExpression') {
          returnProperty.value = returnPropertyValue;
          //TODO: This is only for testing purposes, maybe it could be changed.
          returnProperty.key = { name: returnProperty.expression.left.property.name };
        }

        if (returnPropertyValue.type === 'Identifier') {
          //TODO: This is only for testing purposes, maybe it could be changed.
          returnProperty.key = { name: returnProperty.value.id.name };
        }
      }
    });

  }
}

function getThisExpressionsAccumulated(serviceMeta){
  var properties = [];
  serviceMeta.returnStatement = {
    argument: {
      properties: properties
    }
  };
  return function(node) {
    if (fileHelper.isThisExpressionAssignment(node)) {
      properties.push(node);
    }
  }
}
