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
    angularEsprimaFun.createProjectSemantics(dirTest, (projectSemantics)=>{
      var servicesSemantics = projectSemantics.servicesSemantics;
      var servicesSemanticsTestData = [
        //example1.js
        {
          name: 'serviceA',
          //returnBody: {}, //we get type of object here
          properties: [
            { name: 'shinyNewServiceInstance' }
          ]
        },
        {
          name: 'serviceB',
          //returnBody: {},
          properties: [
            { name: 'sdfg' },
            { name: 'asdf' },
            { name: 'abc' },
            { name: 'bcd' },
            { name: 'xyz' },
            { name: 'chilli' },
            { name: 'anotherChilli' },
            { name: 'jalapeno' }
          ]
        },
        //example2.js
        {
          name: 'nameService',
          //returnBody: {}, //we get type of object here
          properties: [
            { name: 'getData' }
          ]
        }
      ];
      helperTest.testControllerFiles(servicesSemantics, servicesSemanticsTestData, done);
    }, enableVerbose);
  });
});
