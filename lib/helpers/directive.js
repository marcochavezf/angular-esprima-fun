/**
 * Created by marcochavezf on 9/4/16.
 */
var _ = require('lodash');
var fileHelper = require('./file');

module.exports = {
  appendDirectiveStructure: appendDirectiveStructure
};

function appendDirectiveStructure(directives, globalFunctions){
  for (var i=0; i<directives.length; i++){
    var directiveMeta = directives[i];
    if (!_.isNil(directiveMeta.function)){
      //This file has its function appended so we avoid to create structure again.
      continue;
    }

    directiveMeta.function = fileHelper.getBodyFunction(directiveMeta, globalFunctions);
    if (_.isNil(directiveMeta.function)){
      //This file doesn't contain the service body, we could check again but when all files has been parsed.
      continue;
    }

    //Get the first return statement from filter function/constructor
    directiveMeta.returnStatement = fileHelper.getReturnStatement({ elementFunction: directiveMeta.function });
  }
}
