'use strict';

var assert = require('assert');
var angularEsprimaFun = require('../lib');

describe('Controllers', function () {
  it('should parse controllers from local test files', function (done) {

    // Walker options
    var dirTestA = '../../clientside/arvak/www/js';
    var dirTestB = 'test/file.examples';

    angularEsprimaFun.createControllerSemantics(dirTestB, (controllerFiles)=>{
      console.log('controllerFiles', controllerFiles);
      done();
      //assert(true, 'we expected this package author to add actual unit tests.');
    });
  });
});
