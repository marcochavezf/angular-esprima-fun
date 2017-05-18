/**
 * Created by marcochavezf on 5/4/17.
 */
var chai = require('chai');
var should = chai.should();
var angularEsprimaFun = require('../../lib');

describe('Test JS Profile', function () {
  it('testing with profile file', function(done){
    this.timeout(100000);
    var cpuProfilePath = 'test/prototype/CPU-20161215T223525.cpuprofile';
    var pathToFilter = 'http://dev.primotus.com:8080/app';
    var pathOutput = 'test/prototype';
    angularEsprimaFun.getProjectNodesFromProfile({ cpuProfilePath, pathToFilter, pathOutput }, function(projectNodes, error){
      done(error);
    })
  });
});
