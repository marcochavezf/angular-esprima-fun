/**
 * Created by marcochavezf on 8/14/16.
 */
'use strict';

var esprima = require('esprima');
var fs = require('fs');
var walk = require('walk');
var _ = require('lodash');
var angularFileParser = require('./file.parser');
var formatter = require('./helpers/formatter');

/**
 *
 * @type {{createControllerSemantics: createProjectSemantics}}
 */
module.exports = {
  testPrototype: testPrototype,
  createProjectSemantics: createProjectSemantics,
  createSemanticsFromSrc: createSemanticsFromSrc
};

///////////////

function testPrototype(cpuProfilePath, callback){
  var cpuProfileText = fs.readFileSync(cpuProfilePath, 'utf8');
  var cpuProfileJson = JSON.parse(cpuProfileText);

  var chainedAllFunctions = [];
  _.each(cpuProfileJson.nodes, function(functionNode){
    functionNode.childrenNodes = [];
    var doesFnNodeBelongTo = addFunctionToChainedFunctions(chainedAllFunctions, functionNode);

    //If the 'functionNode' wasn't able to be added, then add it to 'chainedFunctions' (root)
    if (!doesFnNodeBelongTo) {
      chainedAllFunctions.push(functionNode);
    }
  });

  fs.writeFile('test/prototype/synthesized_a.json', JSON.stringify(chainedAllFunctions, null, 2), function(error){
    if (error) {
      callback(null, error);
    }
  });

  //filter project node functions
  var urlToFilter = 'http://dev.primotus.com:8080/app';
  var projectNodes = filterProjectNodes(chainedAllFunctions, urlToFilter);

  fs.writeFile('test/prototype/synthesized_b.json', JSON.stringify(projectNodes, null, 2), function(error){
    if (error) {
      callback(null, error);
    }
  });

  callback(projectNodes);
}

function filterProjectNodes(nodeFunctions, urlToFilter){
  var newNodeFnArray = [];

  _.each(nodeFunctions, (nodeFunction) => {

    var isAProjectFile = _.startsWith(nodeFunction.callFrame.url, urlToFilter);
    if (isAProjectFile) {

      newNodeFnArray.push(nodeFunction);
      nodeFunction.childrenNodes = filterProjectNodes(nodeFunction.childrenNodes, urlToFilter);

    } else {

      var projectNodes = filterProjectNodes(nodeFunction.childrenNodes, urlToFilter);

      _.each(projectNodes, (projectNode) => {
        newNodeFnArray.push(projectNode);
      });
    }

  });

  return newNodeFnArray;
}

function addFunctionToChainedFunctions(chainedFunctions, functionNode){
  //1. Check 'children' of each chained function,
  //   if one of those  match with function node then add it to 'childrenNodes' array
  var doesFnNodeBelongTo = _.find(chainedFunctions, function(chainedFn){

    var doesFnNodeBelongTo = _.find(chainedFn.children, function(idChild){
      return idChild === functionNode.id;
    });

    if (doesFnNodeBelongTo){
      chainedFn.childrenNodes.push(functionNode);
      return doesFnNodeBelongTo;
    }

    //2. If 'functionNode' doesn't belong to 'chainedFn.children' then repeat step 1 with each 'childrenNodes'
    return addFunctionToChainedFunctions(chainedFn.childrenNodes, functionNode);
  });

  return doesFnNodeBelongTo;
}

function createProjectSemantics(dir, callback, enableVerbose){
  var walker = walk.walk(dir, { followLinks: false });
  var pathAndSrcFiles = [];

  walker.on('file', function(root, stat, next) {
    // Add this file to the list of files
    var filename = stat.name;
    var pathFile = root + '/' + filename;
    var extension = filename.substring(filename.lastIndexOf('.')+1);
    switch (extension){
      case 'js':
        try {
          var srcCode = fs.readFileSync(pathFile, 'utf8');
          pathAndSrcFiles.push({
            path: pathFile,
            content: srcCode
          });
        } catch (e) {
          console.error('Error with file: ' + pathFile, e);
        }
        break;
    }
    next();
  });


  walker.on('end', function() {
    createSemanticsFromSrc({
      pathAndSrcFiles,
      enableVerbose: false
    }, callback)
  });
}

function createSemanticsFromSrc(args, callback){
  var pathAndSrcFiles = args.pathAndSrcFiles;
  var enableVerbose = args.enableVerbose;
  var filesParsed = [];

  pathAndSrcFiles.forEach(content => {
    try {
      var ast = esprima.parse(content.content, {loc: true, sourceType: 'module'});
      var fileSemantic = angularFileParser.parse(ast);
      filesParsed.push({
        fileSemantic: fileSemantic,
        pathFile: content.path
      });
    } catch (e) {
      console.error('Caught exception in ' + content.path + '. Exception: ' + e);
    }
  });

  if (enableVerbose) {
    formatter.printFilesParsed(filesParsed);
  }

  //Accumulate/collect semantics by type of angular object (controllers, services, etc).
  var globalFunctionsSemantics = angularFileParser.getSemanticsFromFilesParsed(filesParsed, 'globalFunctions');
  var globalVariablesSemantics = angularFileParser.getSemanticsFromFilesParsed(filesParsed, 'globalVariables');
  var controllersSemantics = angularFileParser.getSemanticsFromFilesParsed(filesParsed, 'controllers');
  var directivesSemantics = angularFileParser.getSemanticsFromFilesParsed(filesParsed, 'directives');
  var servicesSemantics = angularFileParser.getSemanticsFromFilesParsed(filesParsed, 'services');
  var filtersSemantics = angularFileParser.getSemanticsFromFilesParsed(filesParsed, 'filters');

  /**
   * Append external functions and parse again, for example we could have a Service body function in ES6 format
   * but could find that function after founding Service declaration.
   */
  angularFileParser.appendGlobalFunctions({
    globalFunctions: globalFunctionsSemantics,
    globalVariables: globalVariablesSemantics,
    controllers: controllersSemantics,
    directives: directivesSemantics,
    services: servicesSemantics,
    filters: filtersSemantics
  });

  callback({
    globalFunctionsSemantics: globalFunctionsSemantics,
    controllersSemantics: controllersSemantics,
    directivesSemantics: directivesSemantics,
    servicesSemantics: servicesSemantics,
    filtersSemantics: filtersSemantics,
    filesParsed: filesParsed
  });
}
