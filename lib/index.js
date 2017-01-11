/**
 * Created by marcochavezf on 8/14/16.
 */
'use strict';

var ctlrParser = require('./controller/parser');
var esprima = require('esprima');
var formatter = require('./formatter');
var fs = require('fs');
var walk    = require('walk');

/**
 *
 * @type {{createControllerSemantics: createControllerSemantics}}
 */
module.exports = {
  createControllerSemantics: createControllerSemantics
};

///////////////

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
        try {
          var srcCode = fs.readFileSync(pathFile, 'utf8');
          var ast = esprima.parse(srcCode, { loc: true });
          var controllerSemantic = ctlrParser.parse(ast);
          ctlrFiles.push({
            controllerSemantic: controllerSemantic,
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
      formatter.printControllerFiles(ctlrFiles);
    }
    callback({
      controllerFiles: ctlrFiles
    });
  });
}



