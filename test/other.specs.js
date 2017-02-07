/**
 * Created by marcochavezf on 1/22/17.
 */
var chai = require('chai');
var should = chai.should();

var angularEsprimaFun = require('../lib');
var helperTest = require('./helpers');
var enableVerbose = false;

describe('Global Functions', function(){
  it('should parse controllers from file.examples/testA (local files)', function (done) {
    if (enableVerbose) {
      this.timeout(5000);
    }

    var dirTest = 'test/file.examples/testB';
    angularEsprimaFun.createProjectSemantics(dirTest, (projectSemantics)=>{
      var globalFunctionsSemantics = projectSemantics.globalFunctionsSemantics;
      var globalFunctionsSemanticsTestData = [
        { name: 'UpdateFactory' },
        { name: 'AppJsonUpdateFactory' },
        { name: 'BinaryUpdateFactory' },
        { name: 'WebUpdateFactory' },
        { name: 'AudioFactory' },
        { name: 'TaskActions' },
        { name: 'setMockResponses' },
        { name: 'AnotherAnotherCtlr' }
      ];
      helperTest.testGlobalFunctions(globalFunctionsSemantics, globalFunctionsSemanticsTestData, done);
    }, enableVerbose);
  });
});


