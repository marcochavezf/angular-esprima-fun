'use strict';

var chai = require('chai');
var should = chai.should();

var angularEsprimaFun = require('../lib');
var helperTest = require('./helpers');
var enableVerbose = false;

describe('Controllers', function () {
  it('should parse controllers from file.examples/testA (local files)', function (done) {
    var dirTest = 'test/file.examples/testA';
    angularEsprimaFun.createControllerSemantics(dirTest, (controllerSemantics)=>{
      var controllersFiles = controllerSemantics.controllerFiles;
      var controllersFilesTestData = [
        [
          //example1.js
          {
            name: 'SpicyController',
            scopeProperties: ['arr', 'isAdmin', 'model', 'spice', 'valFn'],
            scopeFunctions: ['chiliSpicy', 'fnA', 'jalapenoSpicy'],
            thisProperties: [],
            thisFunctions: []
          }
        ]
      ];
      //console.log(JSON.stringify(controllersFiles[0].controllerSemantic.controllers));
      helperTest.testControllerFiles(controllersFiles, controllersFilesTestData, done);
    }, enableVerbose);
  });

  it('should parse controllers from file.examples/testB (local files)', function (done) {

    var dirTest = 'test/file.examples/testB';
    angularEsprimaFun.createControllerSemantics(dirTest, (controllerSemantics)=>{
      var controllersFiles = controllerSemantics.controllerFiles;
      var controllersFilesTestData = [
        [
          //example1.js
          {
            name: 'SpicyController',
            scopeProperties: ['arr', 'isAdmin', 'model', 'spice', 'valFn'],
            scopeFunctions: ['chiliSpicy', 'fnA', 'jalapenoSpicy'],
            thisProperties: [],
            thisFunctions: []
          },
          {
            name: 'AnotherController',
            scopeProperties: ['spice'],
            scopeFunctions: ['chiliSpicy', 'jalapenoSpicy'],
            thisProperties: ['asdf'],
            thisFunctions: ['fnA', 'fnB']
          },
          {
            name: 'AnotherAnotherCtlr',
            scopeProperties: ['spice'],
            scopeFunctions: ['chiliSpicy', 'jalapenoSpicy'],
            thisProperties: [],
            thisFunctions: []
          }
        ],

        //example2.js
        [
          {
            name: 'LoginController',
            scopeProperties: ['invalid', 'isLoading', 'model'],
            scopeFunctions: ['forgotPassword', 'login'],
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
      //assert(true, 'we expected this package author to add actual unit tests.');
    }, false);
  });
});
