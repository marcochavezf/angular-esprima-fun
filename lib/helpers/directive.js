/**
 * Created by marcochavezf on 9/4/16.
 */
var _ = require('lodash');
var estraverse = require('estraverse');
var fileHelper = require('./file');
var ctrlrHelper = require('./controller');

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

    //Get directive controller
    var directiveController = _.find(directiveMeta.returnStatement.argument.properties, function(property){
      return property.key.name === 'controller';
    });

    if (directiveController) {
      directiveMeta.controller = {
        function: fileHelper.getNodeFunctionFromBodyAndGlobals({
          nodeIdentifier: directiveController.value,
          bodyToAnalize: directiveMeta.function.body,
          globalFunctions
        })
      };

      var scopeNameIdentifier = '$scope';
      ctrlrHelper.appendControllerPropAndFunctions(directiveMeta.controller, scopeNameIdentifier);
    }

    //Get directive linker
    var directiveLinker = _.find(directiveMeta.returnStatement.argument.properties, function(property){
      return property.key.name === 'link';
    });

    if (directiveLinker) {
      directiveMeta.link = {
        function: fileHelper.getNodeFunctionFromBodyAndGlobals({
          nodeIdentifier: directiveLinker.value,
          bodyToAnalize: directiveMeta.function.body,
          globalFunctions
        })
      };

      var scopeNameIdentifier = _.head(directiveMeta.link.function.params).name;
      ctrlrHelper.appendControllerPropAndFunctions(directiveMeta.link, scopeNameIdentifier);
    }

    //Get directive compiler
    var directiveCompiler = _.find(directiveMeta.returnStatement.argument.properties, function(property){
      return property.key.name === 'compile';
    });

    if (directiveCompiler) {
      directiveMeta.compile = {
        function: fileHelper.getNodeFunctionFromBodyAndGlobals({
          nodeIdentifier: directiveCompiler.value,
          bodyToAnalize: directiveMeta.function.body,
          globalFunctions
        })
      };

      //Get return statement from 'compile' function.
      var returnStatement = fileHelper.getReturnStatement({ elementFunction: directiveMeta.compile.function });
      var linkExpression = returnStatement.argument;

      //Get link function from compile return statement
       var linkFunction = fileHelper.getNodeFunctionFromBodyAndGlobals({
        nodeIdentifier: linkExpression,
        bodyToAnalize: directiveMeta.function.body,
        globalFunctions
      });

      directiveMeta.compile.link = {
        function: linkFunction
      };

      var scopeNameIdentifier = _.head(linkFunction.params).name;
      ctrlrHelper.appendControllerPropAndFunctions(directiveMeta.compile.link, scopeNameIdentifier);
    }
  }
}
