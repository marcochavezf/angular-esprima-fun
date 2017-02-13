/**
 * Created by marcochavezf on 9/4/16.
 */
var estraverse = require('estraverse');
var _ = require('lodash');
var fileHelper = require('./file');

module.exports = {
  appendFilterStructure: appendFilterStructure
};

function appendFilterStructure(filters, globalFunctions){
  for (var i=0; i<filters.length; i++){
    var filterMeta = filters[i];
    if (!_.isNil(filterMeta.function)){
      //This file has its function appended so we avoid to create structure again.
      continue;
    }

    var filterFunction = fileHelper.getBodyFunction(filterMeta, globalFunctions);
    if (_.isNil(filterFunction)){
      //This file doesn't contain the service body, we could check again but when all files has been parsed.
      continue;
    }

    filterMeta.function = filterFunction;

    //Get the first return statement from service function/constructor
    var returnStatement = fileHelper.getReturnStatement({ elementFunction: filterMeta.function });
    if (returnStatement) {

      //Append returnStatement
      filterMeta.returnStatement = returnStatement;

      //Check if it's just an identifier, then search for the return body (returnArgument).
      var typeOfReturnStatement = returnStatement.argument.type;
      if (typeOfReturnStatement === 'Identifier') {
        //TODO: we could move this function to 'fileHelper' because the same logic is used in serviceHelper
        estraverse.traverse(filterFunction.body, {
          enter: fileHelper.getBodyByIdentifier(returnStatement.argument.name, function(returnArgument){
            //TODO: maybe we can store returnArgument in another property in order to keep the original one.
            returnStatement.argument = returnArgument.init || returnArgument;
          })
        });
      }

    }
  }
}
