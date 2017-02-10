/**
 * Created by marcochavezf on 9/4/16.
 */
var estraverse = require('estraverse');
var _ = require('lodash');
var fileHelper = require('./file');

module.exports = {
  appendServiceStructure: appendServiceStructure
};

function appendServiceStructure(services, globalFunctions){
  for (var i=0; i<services.length; i++){
    var serviceMeta = services[i];
    if (!_.isNil(serviceMeta.function)){
      //This file has its function appended so we avoid to create structure again.
      continue;
    }

    var serviceFunction = fileHelper.getBodyFunction(serviceMeta, globalFunctions);
    if (_.isNil(serviceFunction)){
      //This file doesn't contain the service body, we could check again but when all files has been parsed.
      continue;
    }

    serviceMeta.function = serviceFunction;

    //Get the first return statement from service function/constructor
    estraverse.traverse(serviceFunction.body, { enter: getReturnStatement(serviceMeta) });

    var returnStatement = serviceMeta.returnStatement;
    if (returnStatement) {
      ////// Angular Factory
      //Check if it's just an identifier, then search for the return body (returnArgument).
      var typeOfReturnStatement = returnStatement.argument.type;
      if (typeOfReturnStatement === 'Identifier') {
        estraverse.traverse(serviceFunction.body, {
          enter: fileHelper.getBodyByIdentifier(returnStatement.argument.name, function(returnArgument){
            //TODO: maybe we can store returnArgument in another property in order to keep the original one.
            returnStatement.argument = returnArgument.init || returnArgument;
          })
        });
      }

    } else {
      ////// Angular Service
      //Iff returnStatement doesn't exist then search for each "ThisExpression" and accumulate them all as 'returnStatement'.
      estraverse.traverse(serviceFunction.body, { enter: getThisExpressionsAccumulated(serviceMeta) });
      //getThisExpressionsAccumulated creates 'returnStatement' in serviceMeta
      returnStatement = serviceMeta.returnStatement;
    }


    //Search for each returnBody property and append it to serviceMeta as 'properties'.
    _.each(returnStatement.argument.properties, function(returnProperty) {
      if (returnProperty.value.type === 'Identifier') {
        estraverse.traverse(serviceFunction.body, {
          enter: fileHelper.getBodyByIdentifier(returnProperty.value.name, function (bodyProperty) {
            //TODO: maybe we can store returnArgument in another property in order to keep the original one.
            returnProperty.value = bodyProperty;
          })
        });
      }

      if (_.isNil(returnProperty.key.name)) {
        returnProperty.key.name = returnProperty.key.value;
      }
    });
  }
}

function getReturnStatement(serviceMeta){
  return function(node) {
    if (fileHelper.isReturnStatement(node)) {
      serviceMeta.returnStatement = node;
      return this.break();
    }

    if (!fileHelper.isBlockStatement(node)) {
      this.skip();
    }
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
