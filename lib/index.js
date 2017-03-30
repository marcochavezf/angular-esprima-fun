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
  createSemanticsFromSrc: createSemanticsFromSrc
};

///////////////

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
    var ast = esprima.parse(content.content, { loc: true, sourceType: 'module' });
    var fileSemantic = angularFileParser.parse(ast);
    filesParsed.push({
      fileSemantic: fileSemantic,
      pathFile: content.path
    });
  });

  if (enableVerbose) {
    formatter.printFilesParsed(filesParsed);
  }

  //Accumulate/collect semantics by type of angular object (controllers, services, etc).
  var globalFunctionsSemantics = angularFileParser.getSemanticsFromFilesParsed(filesParsed, 'globalFunctions');
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
