/**
 * Created by marcochavezf on 1/22/17.
 */
'use strict';

var chai = require('chai');
var should = chai.should();

var angularEsprimaFun = require('../lib');
var helperTest = require('./helpers');
var enableVerbose = false;

describe('Controllers', function () {
  it('should parse controllers from file.examples/testA (local files)', function (done) {
    this.timeout(10000);

    var dirTest = 'test/file.examples/testA';
    angularEsprimaFun.createProjectSemantics(dirTest, (projectSemantics)=>{
      var controllersSemantics = projectSemantics.controllersSemantics;
      var controllersSemanticsTestData = [
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
      ];
      helperTest.testControllerFiles(controllersSemantics, controllersSemanticsTestData, done);
    }, enableVerbose);
  });

  it('should parse controllers from file.examples/testB (local files)', function (done) {
    if (enableVerbose){
      this.timeout(5000);
    }
    var dirTest = 'test/file.examples/testB/controllers';
    angularEsprimaFun.createProjectSemantics(dirTest, (projectSemantics)=>{
      var controllersSemantics = projectSemantics.controllersSemantics;
      var controllersSemanticsTestData = [
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
        },
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
      ];
      helperTest.testControllerFiles(controllersSemantics, controllersSemanticsTestData, done);
    }, enableVerbose);
  });
});
