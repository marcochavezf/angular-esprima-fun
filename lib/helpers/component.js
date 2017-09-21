/**
 * Created by marcochavezf on 9/4/16.
 */
var _ = require('lodash');
var estraverse = require('estraverse');
var fileHelper = require('./file');
var ctrlrHelper = require('./controller');

module.exports = {
  appendComponentStructure: appendComponentStructure
};

function appendComponentStructure(components, globalFunctions, globalVariables){

  for (var i=0; i<components.length; i++){
    var componentMeta = components[i];
    if (!_.isNil(componentMeta.object)){
      //This file has its function appended so we avoid to create structure again.
      continue;
    }

    componentMeta.object = fileHelper.getBodyObject(componentMeta, globalVariables);
    if (_.isNil(componentMeta.object)){
      //This file doesn't contain the service body, we could check again but when all files has been parsed.
      continue;
    }

    //Get directive controller
    var componentController = _.find(componentMeta.object.properties, function(property){
      return property.key.name === 'controller';
    });

    if (componentController) {
      if (componentController.value.type === 'Literal') {
        componentMeta.controller = {
          literal: componentController.value.value
        };
      } else {

        componentMeta.controller = {
          function: fileHelper.getNodeValueFromGlobals({
            nodeIdentifier: componentController.value,
            globalFunctions,
            globalVariables
          })
        };

        var scopeNameIdentifier = '$scope';
        ctrlrHelper.appendControllerPropAndFunctions(componentMeta.controller, scopeNameIdentifier);
      }
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
