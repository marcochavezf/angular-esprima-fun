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
      directiveMeta.controller = {};
      var controllerFn = directiveController.value;
      switch (controllerFn.type) {
        case 'FunctionExpression':
          directiveMeta.controller.function = controllerFn;
          ctrlrHelper.appendControllerPropAndFunctions(directiveMeta.controller);
          break;

        case 'Identifier':
          directiveMeta.controller.node = controllerFn;
          ctrlrHelper.appendControllersStructure([directiveMeta.controller], globalFunctions);
          break;
      }
    }

    //Get directive linker
    var directiveLinker = _.find(directiveMeta.returnStatement.argument.properties, function(property){
      return property.key.name === 'link';
    });

    if (directiveLinker) {
      directiveMeta.link = {};
      var linkerFn = directiveLinker.value;
      switch (linkerFn.type) {
        case 'FunctionExpression':
          var scopeNameIdentifier = _.head(linkerFn.params).name;
          directiveMeta.link.function = linkerFn;
          ctrlrHelper.appendControllerPropAndFunctions(directiveMeta.link, scopeNameIdentifier);
          break;

        case 'Identifier':
          estraverse.traverse(directiveMeta.function.body, {
            enter: fileHelper.getBodyByIdentifier(linkerFn.name, function(linkerFunction){
              if (linkerFunction.init) {
                directiveMeta.link.functionMeta = linkerFunction;
                directiveMeta.link.function = linkerFunction.init;
              } else {
                directiveMeta.link.function = linkerFunction;
              }
            })
          });
          var scopeNameIdentifier = _.head(directiveMeta.link.function.params).name;
          ctrlrHelper.appendControllerPropAndFunctions(directiveMeta.link, scopeNameIdentifier);
          break;
      }
    }
  }
}
