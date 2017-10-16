/**
 * Created by marcochavezf on 9/18/17.
 */
var chai = require('chai');
var should = chai.should();
var _ = require('lodash');

var angularEsprimaFun = require('../../lib');
var helperTest = require('../helpers');
var enableVerbose = false;

describe('Components', function () {

	it('should parse component from file.examples/testF (local files)', function (done) {
		this.timeout(5000);

		var dirTest = 'test/file.examples/testF';
		angularEsprimaFun.createProjectSemantics(dirTest, (projectSemantics)=> {
			var componentsSemantics = projectSemantics.componentsSemantics;

			var componentA = componentsSemantics[0];
			componentA.name.should.equal('heroDetail');
			componentA.object.properties.should.have.length(3);
			componentA.controller.scopeProperties.should.have.length(1);
			componentA.controller.scopeFunctions.should.have.length(2);

			var componentB = componentsSemantics[1];
			componentB.name.should.equal('counter');
			componentB.object.properties.should.have.length(2);
			componentB.controller.thisFunctions.should.have.length(2);

			var componentC = componentsSemantics[2];
			componentC.name.should.equal('groupComponent');
			componentC.object.properties.should.have.length(4);
			componentC.controller.thisProperties.should.have.length(1);

			var componentD = componentsSemantics[3];
			componentD.name.should.equal('groupComponent2');
			componentD.object.properties.should.have.length(4);
			componentD.controller.thisProperties.should.have.length(1);

			done();
		}, enableVerbose);
	});
});