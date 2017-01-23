/**
 * Created by marcochavezf on 1/22/17.
 */
var chai = require('chai');
var should = chai.should();

var angularEsprimaFun = require('../lib');
var helperTest = require('./helpers');
var enableVerbose = false;

describe.skip('Services', function(){
  it('should parse services from file.examples/testA (local files)', function (done) {
    if (enableVerbose) {
      this.timeout(5000);
    }

    var dirTest = 'test/file.examples/testA';
    //TODO: modify service test
    /*
    angularEsprimaFun.createProjectSemantics(dirTest, (projectSemantics)=>{
      var servicesSemantics = projectSemantics.servicesSemantics;
      var servicesSemanticsTestData = [
        //example1.js
        {
          name: 'serviceA',
          //body: {}, //we get type of object here
          properties: [
            { name: 'shinyNewServiceInstance', type: 'variable' }
          ],
        },
        {
          name: 'serviceB',
          //body: {}, //we get type of object here
          properties: [
            { name: 'sdfg' },
            { name: 'asdf' },
            { name: 'abc' },
            { name: 'bcd.efg' },
            { name: 'bcd.fn()' },
            { name: 'chilli' },
            { name: 'anotherChilli' },
            { name: 'jalapeno' }
          ],
          publicVariables: []
        },
        //example2.js
        {
          name: 'serviceA',
          //body: {}, //we get type of object here
          properties: [
            { name: 'shinyNewServiceInstance' }
          ],
          publicVariables: []
        }
      ];
      helperTest.testControllerFiles(controllersSemantics, controllersSemanticsTestData, done);
    }, enableVerbose);
    */
  });
});
