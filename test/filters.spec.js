/**
 * Created by marcochavezf on 1/22/17.
 */
var chai = require('chai');
var should = chai.should();

var angularEsprimaFun = require('../lib');
var helperTest = require('./helpers');
var enableVerbose = false;

describe.skip('Filters', function(){
  it('should parse filters from file.examples/testA (local files)', function (done) {
    if (enableVerbose) {
      this.timeout(5000);
    }

    var dirTest = 'test/file.examples/testA';
    angularEsprimaFun.createProjectSemantics(dirTest, (projectSemantics)=>{
      var servicesSemantics = projectSemantics.filtersSemantics;
      var servicesSemanticsTestData = [
        //example1.js
        {
          name: 'myReverseFilterApp'
        },
        //example2.js
        {
          name: 'myStatefulFilterApp'
        }
      ];
      helperTest.testServiceFiles(servicesSemantics, servicesSemanticsTestData, done);
    }, enableVerbose);
  });

});
