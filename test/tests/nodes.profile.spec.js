/**
 * Created by marcochavezf on 5/4/17.
 */
var fs = require('fs');
var chai = require('chai');
var should = chai.should();
var angularEsprimaFun = require('../../lib');

describe('Test JS Profile', function () {
  it('testing with a manually generated profile file', function(done){
    var cpuProfilePath = 'test/file.examples/testE/profileA.json';
    var pathToFilter = 'good';
    angularEsprimaFun.getProjectNodesFromProfile({ cpuProfilePath, pathToFilter }, function(projectNodes, error){
      var expectedOutPutText = fs.readFileSync('test/file.examples/testE/profileB.json', 'utf8');
      var expectedOutPut = JSON.parse(expectedOutPutText);
      projectNodes.should.to.deep.equal(expectedOutPut.nodes);
      done(error);
    })
  });

  it.skip('testing with a real profile file', function(done){
    this.timeout(100000);
    var cpuProfilePath = 'test/prototype/CPU-20161215T223525.cpuprofile';
    var pathToFilter = 'http://dev.primotus.com:8080/app';
    var pathOutput = 'test/prototype';
    angularEsprimaFun.getProjectNodesFromProfile({ cpuProfilePath, pathToFilter, pathOutput }, function(projectNodes, error){
      done(error);
    })
  });
});
