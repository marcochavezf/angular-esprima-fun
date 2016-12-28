/**
 * Created by marcochavezf on 8/14/16.
 */
'use strict';

var ctlrParser = require('./controller/parser');
var esprima = require('esprima');
var formatter = require('./formatter');
var fs = require('fs');
var walk    = require('walk');
var _ = require('lodash');

/**
 *
 * @type {{createControllerSemantics: createControllerSemantics}}
 */
module.exports = {
  createControllerSemantics: createControllerSemantics,
  testPrototype: testPrototype
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

function createControllerSemantics(dir, callback, enableVerbose){
  var walker = walk.walk(dir, { followLinks: false });
  var ctlrFiles = [];

  walker.on('file', function(root, stat, next) {
    // Add this file to the list of files
    var filename = stat.name;
    var pathFile = root + '/' + filename;
    var extension = filename.substring(filename.lastIndexOf('.')+1);
    switch (extension){
      case 'js':
        var srcCode = fs.readFileSync(pathFile, 'utf8');
        var ast = esprima.parse(srcCode, { loc: true });
        var controllerSemantic = ctlrParser.parse(ast);
        ctlrFiles.push({
          controllerSemantic: controllerSemantic,
          pathFile: pathFile
        });
        break;
    }
    next();
  });

  walker.on('end', function() {
    if (enableVerbose) {
      formatter.printControllerFiles(ctlrFiles);
    }
    callback({
      controllerFiles: ctlrFiles
    });
  });
}
