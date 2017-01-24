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
  createProjectSemantics: createProjectSemantics
};

///////////////

function createProjectSemantics(dir, callback, enableVerbose){
  var walker = walk.walk(dir, { followLinks: false });
  var filesParsed = [];

  walker.on('file', function(root, stat, next) {
    // Add this file to the list of files
    var filename = stat.name;
    var pathFile = root + '/' + filename;
    var extension = filename.substring(filename.lastIndexOf('.')+1);
    switch (extension){
      case 'js':
        try {
          var srcCode = fs.readFileSync(pathFile, 'utf8');
          var ast = esprima.parse(srcCode, { loc: true, sourceType: 'module' });
          var fileSemantic = angularFileParser.parse(ast);
          filesParsed.push({
            fileSemantic: fileSemantic,
            pathFile: pathFile
          });
        } catch (e) {
          console.error('Error with file: ' + pathFile, e);
        }
        break;
    }
    next();
  });

  walker.on('end', function() {
    if (enableVerbose) {
      formatter.printFilesParsed(filesParsed);
    }
    //Accumulate/collect semantincs by type of angular object (controllers, services, etc).
    var globalFunctionsSemantics = _.reduce(filesParsed, function(accum, fileParsed){
      var globalFunctions = _.map(fileParsed.fileSemantic.globalFunctions, function(globalFunction){
        globalFunction.pathFile = fileParsed.pathFile;
        return globalFunction;
      });
      return accum.concat(globalFunctions)
    }, []);

    var controllersSemantics = _.reduce(filesParsed, function(accum, fileParsed){
      var controllers = _.map(fileParsed.fileSemantic.controllers, function(controller){
        controller.pathFile = fileParsed.pathFile;
        return controller;
      });
      return accum.concat(controllers)
    }, []);

    var servicesSemantics = _.reduce(filesParsed, function(accum, fileParsed){
      var services = _.map(fileParsed.fileSemantic.services, function(service){
        service.pathFile = fileParsed.pathFile;
        return service;
      });
      return accum.concat(services)
    }, []);

    callback({
      filesParsed: filesParsed,
      globalFunctionsSemantics: globalFunctionsSemantics,
      controllersSemantics: controllersSemantics,
      servicesSemantics: servicesSemantics
    });
  });
}



