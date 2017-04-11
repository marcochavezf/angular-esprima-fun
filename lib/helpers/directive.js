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

function appendDirectiveStructure(directives, globalFunctions, globalVariables){

  for (var i=0; i<directives.length; i++){
    var directiveMeta = directives[i];
    if (!_.isNil(directiveMeta.function)){
      //This file has its function appended so we avoid to create structure again.
      continue;
    }

    directiveMeta.function = fileHelper.getBodyFunction(directiveMeta, globalFunctions, globalVariables);
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
      if (directiveController.value.type === 'Literal') {
        directiveMeta.controller = {
          literal: directiveController.value.value
        };
      } else {

        directiveMeta.controller = {
          function: fileHelper.getNodeValueFromBodyAndGlobals({
            nodeIdentifier: directiveController.value,
            bodyToAnalize: directiveMeta.function.body,
            globalFunctions,
            globalVariables
          })
        };

        var scopeNameIdentifier = '$scope';
        ctrlrHelper.appendControllerPropAndFunctions(directiveMeta.controller, scopeNameIdentifier);
      }
    }

    //Get directive linker
    var directiveLinker = _.find(directiveMeta.returnStatement.argument.properties, function(property){
      return property.key.name === 'link';
    });

    if (directiveLinker) {
      directiveMeta.link = getLinkStructure({
        nodeIdentifier: directiveLinker.value,
        bodyToAnalize: directiveMeta.function.body,
        globalFunctions
      });
    }

    //Get directive compiler
    var directiveCompiler = _.find(directiveMeta.returnStatement.argument.properties, function(property){
      return property.key.name === 'compile';
    });

    if (directiveCompiler) {
      directiveMeta.compile = {
        function: null,
        link: null
      };

      directiveMeta.compile.function = fileHelper.getNodeValueFromBodyAndGlobals({
        nodeIdentifier: directiveCompiler.value,
        bodyToAnalize: directiveMeta.function.body,
        globalFunctions
      });

      //Get return statement from 'compile' function.
      var returnStatement = fileHelper.getReturnStatement({ elementFunction: directiveMeta.compile.function });
      var linkExpression = returnStatement.argument;

      directiveMeta.compile.link = getLinkStructure({
        nodeIdentifier: linkExpression,
        bodyToAnalize: directiveMeta.function.body,
        globalFunctions
      });
    }
  }
}

function getLinkStructure({ nodeIdentifier, bodyToAnalize, globalFunctions }){
  var link = {
    pre: {},
    post: {}
  };

  var linkBodyValue = fileHelper.getNodeValueFromBodyAndGlobals({
    nodeIdentifier: nodeIdentifier, //directiveLinker.value,
    bodyToAnalize: bodyToAnalize, //directiveMeta.function.body,
    globalFunctions
  });

  switch (linkBodyValue.type){
    case 'FunctionExpression':
      link.post.function = linkBodyValue;
      break;

    case 'ObjectExpression':
      var postLink = _.find(linkBodyValue.properties, (property) => { return property.key.name === 'post' });
      if (postLink) {
        link.post.function = fileHelper.getNodeValueFromBodyAndGlobals({
          nodeIdentifier: postLink.value,
          bodyToAnalize: bodyToAnalize,
          globalFunctions
        });
      }

      var preLink = _.find(linkBodyValue.properties, (property) => { return property.key.name === 'pre' });
      if (preLink) {
        link.pre.function = fileHelper.getNodeValueFromBodyAndGlobals({
          nodeIdentifier: preLink.value,
          bodyToAnalize: bodyToAnalize,
          globalFunctions
        });
      }
      break;
  }

  if (link.post.function) {
    var scopeNameIdentifier = _.head(link.post.function.params).name;
    ctrlrHelper.appendControllerPropAndFunctions(link.post, scopeNameIdentifier);
  }

  if (link.pre.function) {
    var scopeNameIdentifier = _.head(link.pre.function.params).name;
    ctrlrHelper.appendControllerPropAndFunctions(link.pre, scopeNameIdentifier);
  }

  return link;
}
