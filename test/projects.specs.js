/**
 * Created by marcochavezf on 1/22/17.
 */
var chai = require('chai');
var should = chai.should();

var angularEsprimaFun = require('../lib');
var helperTest = require('./helpers');
var enableVerbose = false;

describe('Projects', function(){
  it('should parse a project containing all kind of angular components', function (done) {
    this.timeout(60000);

    var projectContentA = require('./file.examples/testC/project-a-example.json');
    angularEsprimaFun.createSemanticsFromSrc({ pathAndSrcFiles: projectContentA.srcContent }, (projectSemantics)=>{
      projectContentA.srcContent.length.should.equal(projectSemantics.filesParsed.length);
      //TODO: add more cases to test
      done();
    }, enableVerbose);
  });
});


