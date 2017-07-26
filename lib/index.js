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
  createProjectSemantics: createProjectSemantics,
  createSemanticsFromSrc: createSemanticsFromSrc,
  getProjectNodesFromProfile: getProjectNodesFromProfile
};

///////////////

function getProjectNodesFromProfile(params, callback){
  var cpuProfileJson = params.cpuProfileJson;
  var cpuProfilePath = params.cpuProfilePath;
  var pathToFilter = params.pathToFilter;
  var pathOutput = params.pathOutput;

  if (params.cpuProfilePath) {
    var cpuProfileText = fs.readFileSync(cpuProfilePath, 'utf8');
    cpuProfileJson = JSON.parse(cpuProfileText);
  }

  var chainedAllFunctions = getAllChainedFunctions(cpuProfileJson);
  if (pathOutput) {
    fs.writeFile(pathOutput + '/chained_functions.json', JSON.stringify(chainedAllFunctions, null, 2), function (error) {
      if (error) {
        callback(null, error);
      }
    });
  }

  //filter project node functions
  var projectNodes = filterProjectNodes(chainedAllFunctions, pathToFilter);

  if (pathOutput) {
    fs.writeFile(pathOutput + '/project_nodes.json', JSON.stringify(projectNodes, null, 2), function (error) {
      if (error) {
        callback(null, error);
      }
    });
  }

  callback(projectNodes);
}

function getAllChainedFunctions(cpuProfileJson){
  if (_.isEmpty(cpuProfileJson.nodes)) {
    return [];
  }

  var rootNode = null;
  var parentsLookingForChildren = {};
  var childrenNodes = {};
  _.each(cpuProfileJson.nodes, function(functionNode){
    //check parent nodes
    var parentNode = parentsLookingForChildren[functionNode.id];
    if (parentNode) {
      parentNode.childrenNodes.push(functionNode);
    } else {
      childrenNodes[functionNode.id] = functionNode;
    }

    //check children nodes
    _.each(functionNode.children, function(childNodeId){
      var childNode = childrenNodes[childNodeId];
      if (childNode) {
        functionNode.childrenNodes.push(childNode);
      } else {
        functionNode.childrenNodes = [];
        parentsLookingForChildren[childNodeId] = functionNode;
      }
    });

    //get the root node in each iteration
    if (rootNode) {
      if (functionNode.id < rootNode.id) {
        rootNode = functionNode;
      }
    } else {
      rootNode = functionNode;
    }
  });

  return [rootNode];
}

function filterProjectNodes(nodeFunctions, pathToFilter){
  var newNodeFnArray = [];

  _.each(nodeFunctions, (nodeFunction) => {

    var isAProjectFile = _.startsWith(nodeFunction.callFrame.url, pathToFilter);
    if (isAProjectFile) {

      newNodeFnArray.push(nodeFunction);
      nodeFunction.childrenNodes = filterProjectNodes(nodeFunction.childrenNodes, pathToFilter);

    } else {

      var projectNodes = filterProjectNodes(nodeFunction.childrenNodes, pathToFilter);

      _.each(projectNodes, (projectNode) => {
        newNodeFnArray.push(projectNode);
      });
    }

  });

  return newNodeFnArray;
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
