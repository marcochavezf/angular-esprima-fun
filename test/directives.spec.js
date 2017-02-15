/**
 * Created by marcochavezf on 1/22/17.
 */
var chai = require('chai');
var should = chai.should();

var angularEsprimaFun = require('../lib');
var helperTest = require('./helpers');
var enableVerbose = false;

describe.skip('Directives', function(){
  it('should parse directives from file.examples/testA (local files)', function (done) {
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
          returnStatement: {
            argument: {
              id: { name: 'shinyNewServiceInstance' }
            }
          }
        },
        {
          name: 'serviceB',
          returnStatement: {
            argument: {
              properties: [
                { key: { name: 'sdfg' } },
                { key: { name: 'asdf' } },
                { key: { name: 'abc' } },
                { key: { name: 'bcd' } },
                { key: { name: 'xyz' } },
                { key: { name: 'chilli' } },
                { key: { name: 'anotherChilli' } },
                { key: { name: 'jalapeno' } }
              ]
            }
          }
        },
        //example2.js
        {
          name: 'nameService',
          returnStatement: {
            argument: {
              properties: [
                { key: { name: 'getData' } }
              ]
            }
          }
        }
      ];
      helperTest.testServiceFiles(servicesSemantics, servicesSemanticsTestData, done);
    }, enableVerbose);
  });


  it.skip('should parse directives from file.examples/testB (local files)', function (done) {
    if (enableVerbose) {
      this.timeout(5000);
    }

    var dirTest = 'test/file.examples/testB';
    angularEsprimaFun.createProjectSemantics(dirTest, (projectSemantics)=>{
      var servicesSemantics = projectSemantics.servicesSemantics;
      var servicesSemanticsTestData = [
        //example5.js
        {
          name: 'MyService',
          returnStatement: {
            argument: {
              properties: [
                { key: { name: 'anotherFunction' } },
                { key: { name: 'sayHello' } }
              ]
            }
          }
        }
      ];
      helperTest.testServiceFiles(servicesSemantics, servicesSemanticsTestData, done);
    }, enableVerbose);
  });
});
