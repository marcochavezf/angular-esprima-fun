/**
 * Created by marcochavezf on 1/22/17.
 */
var chai = require('chai');
var should = chai.should();

var angularEsprimaFun = require('../lib');
var helperTest = require('./helpers');
var enableVerbose = false;

describe('Filters', function(){
  it('should parse filters from file.examples/testA (local files)', function (done) {
    if (enableVerbose) {
      this.timeout(5000);
    }

    var dirTest = 'test/file.examples/testA';
    angularEsprimaFun.createProjectSemantics(dirTest, (projectSemantics)=>{
      var filtersSemantics = projectSemantics.filtersSemantics;
      var filtersSemanticsTestData = [
        //example1.js
        {
          name: 'reverse',
          returnStatement: {
            argument: {
              params: [{ name: 'input' }, { name: 'uppercase' }]
            }
          }
        },
        //example2.js
        {
          name: 'decorate',
          returnStatement: {
            argument: {
              params: [{ name: 'input' }]
            }
          }
        }
      ];
      helperTest.testFilters(filtersSemantics, filtersSemanticsTestData, done);
    }, enableVerbose);
  });

});
