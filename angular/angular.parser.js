/**
 * Created by marcochavezf on 8/14/16.
 */
var ctlrParser = require('./controller/parser');
var esprima = require('esprima');
var formatter = require('./formatter');
var fs = require('fs');
var walk    = require('walk');

// Walker options
var dirTestA = '../../clientside/arvak/www/js';
var dirTestB = '../angular/tests';

var walker = walk.walk(dirTestA, { followLinks: false });
var ctlrFiles = [];

walker.on('file', function(root, stat, next) {
	// Add this file to the list of files
	var filename = stat.name;
	var pathFile = root + '/' + filename;
	var extension = filename.substring(filename.lastIndexOf('.')+1);

	switch (extension){
		case 'js':
			var srcCode = fs.readFileSync(pathFile, 'utf8');
			var ast = esprima.parse(srcCode, {loc: false});
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
	formatter.printControllerFiles(ctlrFiles);
});

//