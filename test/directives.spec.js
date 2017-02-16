/**
 * Created by marcochavezf on 1/22/17.
 */
var chai = require('chai');
var should = chai.should();

var angularEsprimaFun = require('../lib');
var helperTest = require('./helpers');
var enableVerbose = false;

describe('Directives', function(){
  it('should parse directives from file.examples/testA (local files)', function (done) {
    if (enableVerbose) {
      this.timeout(5000);
    }

    var dirTest = 'test/file.examples/testA';
    angularEsprimaFun.createProjectSemantics(dirTest, (projectSemantics)=>{
      var directivesSemantics = projectSemantics.directivesSemantics;
      var directivesSemanticsTestData = [
        //example1.js
        {
          name: 'helloWorld',
          returnStatement: {
          }
        },
        //example2.js
        {
          name: 'helloWorld',
          returnStatement: {
          }
        },
        //example3.js
        {
          name: 'notepad',
          returnStatement: {
          }
        }
      ];
      helperTest.testDirectiveFiles(directivesSemantics, directivesSemanticsTestData, done);
    }, enableVerbose);
  });


  it('should parse directives from file.examples/testB (local files)', function (done) {
    if (enableVerbose) {
      this.timeout(5000);
    }

    var dirTest = 'test/file.examples/testB';
    angularEsprimaFun.createProjectSemantics(dirTest, (projectSemantics)=>{
      var directivesSemantics = projectSemantics.directivesSemantics;
      var directivesSemanticsTestData = [
        //example1.js
        {
          name: 'ionDatetimePicker',
          returnStatement: {
          }
        },
        //example2.js
        {
          name: 'searchBar',
          returnStatement: {
          }
        },
        //example3.js
        {
          name: 'arField',
          returnStatement: {
          }
        }
      ];
      helperTest.testDirectiveFiles(directivesSemantics, directivesSemanticsTestData, done);
    }, enableVerbose);
  });
});
