'use strict';

var chai = require('chai');
var should = chai.should();

var angularEsprimaFun = require('../lib');

describe('Test JS Profile', function () {
  var cpuProfilePath = 'test/prototype/CPU-20161215T223525.cpuprofile';
  it('testing with profile file', function(done){
    this.timeout(100000);
    angularEsprimaFun.testPrototype(cpuProfilePath, function(projectNodes, error){
      done(error);
    })
  });
});
