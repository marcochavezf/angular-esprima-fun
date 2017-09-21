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

	it.only('should parse component from file.examples/testF (local files)', function (done) {
		if (enableVerbose) {
			this.timeout(5000);
		}

		var dirTest = 'test/file.examples/testF';
		angularEsprimaFun.createProjectSemantics(dirTest, (projectSemantics)=> {
			var componentsSemantics = projectSemantics.componentsSemantics;
			var directive = directivesSemantics[0];
			directive.name.should.equal('dateWidget');
			directive.returnStatement.argument.properties.should.have.length(5);
			done();
		}, enableVerbose);
	});

});