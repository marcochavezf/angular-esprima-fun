'use strict';

var chai = require('chai');
var should = chai.should();

var angularEsprimaFun = require('../lib');
var helperTest = require('./helpers');
var enableVerbose = false;

describe('Test JS Profile', function () {
  var cpuProfilePath = 'test/prototype/CPU-20161215T223525.cpuprofile';
  it('testing with profile file', function(done){
    this.timeout(100000);
    angularEsprimaFun.testPrototype(cpuProfilePath, function(projectNodes, error){
      done(error);
    })
  });
});


describe.skip('Controllers', function () {
  it('should parse controllers from file.examples/testA (local files)', function (done) {
    var dirTest = 'test/file.examples/testA';
    angularEsprimaFun.createControllerSemantics(dirTest, (controllerSemantics)=>{
      var controllersFiles = controllerSemantics.controllerFiles;
      var controllersFilesTestData = [
        [
          //example1.js
          {
            name: 'SpicyController',
            scopeProperties: [
              { name: 'arr',            line: 14 },
              { name: 'isAdmin',        line: 13 },
              { name: 'model',          line:  9 },
              { name: 'spice',          line: 20 },
              { name: 'valFn',          line: 12 }],
            scopeFunctions: [
              { name: 'chiliSpicy',     line: 24 },
              { name: 'fnA',            line:  8 },
              { name: 'jalapenoSpicy',  line: 28 }],
            thisProperties: [],
            thisFunctions: []
          }
        ]
      ];
      helperTest.testControllerFiles(controllersFiles, controllersFilesTestData, done);
    }, enableVerbose);
  });

  it('should parse controllers from file.examples/testB (local files)', function (done) {

    var dirTest = 'test/file.examples/testB/controllers';
    angularEsprimaFun.createControllerSemantics(dirTest, (controllerSemantics)=>{
      var controllersFiles = controllerSemantics.controllerFiles;
      var controllersFilesTestData = [
        [
          //example1.js
          {
            name: 'SpicyController',
            scopeProperties: [
              { name: 'arr',            line: 16 },
              { name: 'isAdmin',        line: 15 },
              { name: 'model',          line: 11 },
              { name: 'spice',          line: 22 },
              { name: 'valFn',          line: 14 }],
            scopeFunctions: [
              { name: 'chiliSpicy',     line: 26 },
              { name: 'fnA',            line: 10 },
              { name: 'jalapenoSpicy',  line: 30 }],
            thisProperties: [],
            thisFunctions: []
          },
          {
            name: 'AnotherController',
            scopeProperties: [
              { name: 'spice',          line: 47 }],
            scopeFunctions: [
              { name: 'chiliSpicy',     line: 49 },
              { name: 'jalapenoSpicy',  line: 55 }],
            thisProperties: [
              { name: 'asdf',           line: 43 }],
            thisFunctions: [
              { name: 'fnA',            line: 44 },
              { name: 'fnB',            line: 45 }]
          },
          {
            name: 'AnotherAnotherCtlr',
            scopeProperties: [
              { name: 'spice',          line: 65 }],
            scopeFunctions: [
              { name: 'chiliSpicy',     line: 67 },
              { name: 'jalapenoSpicy',  line: 71 }],
            thisProperties: [],
            thisFunctions: []
          }
        ],

        //example2.js
        [
          {
            name: 'LoginController',
            scopeProperties: [
              { name: 'invalid',        line: 20 },
              { name: 'isLoading',      line: 14 },
              { name: 'model',          line: 15 }],
            scopeFunctions: [
              { name: 'forgotPassword', line: 22 },
              { name: 'login',          line: 25 }],
            thisProperties: [],
            thisFunctions: []
          }
        ]
      ];
      helperTest.testControllerFiles(controllersFiles, controllersFilesTestData, done);
    }, enableVerbose);
  });

  it.skip('should parse controllers from local test files', function (done) {

    // Walker options
    var dirTest = '../../clientside/arvak/www/js';
    angularEsprimaFun.createControllerSemantics(dirTest, (controllerFiles)=>{
      console.log('controllerFiles', controllerFiles);
      done();
    }, false);
  });
});
