/**
 * Created by marcochavezf on 9/4/16.
 */
var _ = require('lodash');
var fileHelper = require('./file');

module.exports = {
  appendFilterStructure: appendFilterStructure
};

function appendFilterStructure(filters, globalFunctions, globalVariables){
  for (var i=0; i<filters.length; i++){
    var filterMeta = filters[i];
    if (!_.isNil(filterMeta.function)){
      //This file has its function appended so we avoid to create structure again.
      continue;
    }

    filterMeta.function = fileHelper.getBodyFunction(filterMeta, globalFunctions, globalVariables);
    if (_.isNil(filterMeta.function)){
      //This file doesn't contain the service body, we could check again but when all files has been parsed.
      continue;
    }

    //Get the first return statement from filter function/constructor
    filterMeta.returnStatement = fileHelper.getReturnStatement({ elementFunction: filterMeta.function });
  }
}
