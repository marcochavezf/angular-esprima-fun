/**
 * Created by marcochavezf on 1/22/17.
 */
var chai = require('chai');
var should = chai.should();

var angularEsprimaFun = require('../lib');
var helperTest = require('./helpers');
var enableVerbose = false;

describe('Projects', function(){
  it('should parse a project containing all kind of angular components (Project A)', function (done) {
    this.timeout(60000);

    var projectContentA = require('./file.examples/testC/project-a-example.json');
    angularEsprimaFun.createSemanticsFromSrc({ pathAndSrcFiles: projectContentA.srcContent }, (projectSemantics)=>{
      projectContentA.srcContent.length.should.equal(projectSemantics.filesParsed.length);
      //TODO: add more cases to test
      done();
    }, enableVerbose);
  });

  it('should parse a project containing all kind of angular components (Project B)', function (done) {
    this.timeout(60000);

    var projectContentA = require('./file.examples/testC/project-b-example.json');
    angularEsprimaFun.createSemanticsFromSrc({ pathAndSrcFiles: projectContentA.srcContent }, (projectSemantics)=>{
      projectContentA.srcContent.length.should.equal(projectSemantics.filesParsed.length);
      //TODO: add more cases to test
      done();
    }, enableVerbose);
  });

  it('should parse directives from file.examples/testD/example5.js (local files)', function (done) {
    this.timeout(60000);

    var dirTest = 'test/file.examples/testD/example5.js';
    angularEsprimaFun.createProjectSemantics(dirTest, (projectSemantics)=>{
      projectSemantics.controllersSemantics.should.have.length(2);
      projectSemantics.directivesSemantics.should.have.length(5);
      projectSemantics.servicesSemantics.should.have.length(3);
      done();
    }, enableVerbose);
  });
});


