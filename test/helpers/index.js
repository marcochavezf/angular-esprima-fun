/**
 * Created by marcochavezf on 9/22/16.
 */

module.exports = {
  testControllerFiles: testControllerFiles,
  testGlobalFunctions: testGlobalFunctions,
  testServiceFiles: testServiceFiles
};

/////////////

function testControllerFiles(controllersSemantics, controllersSemanticsTestData, done){
  controllersSemantics.should.have.length(controllersSemanticsTestData.length);
  controllersSemantics.forEach((controller, index)=>{

    var controllerTestData = controllersSemanticsTestData[index];
    controller.name.should.equal(controllerTestData.name);

    //scopeProperties
    controller.scopeProperties.should.have.length(controllerTestData.scopeProperties.length);
    controller.scopeProperties.forEach((scopeProperty, index)=>{
      scopeProperty.name.should.equal(controllerTestData.scopeProperties[index].name);
      scopeProperty.node.loc.start.line.should.equal(controllerTestData.scopeProperties[index].line);
    });

    //scopeFunctions
    controller.scopeFunctions.should.have.length(controllerTestData.scopeFunctions.length);
    controller.scopeFunctions.forEach((scopeFunction, index)=>{
      scopeFunction.name.should.equal(controllerTestData.scopeFunctions[index].name);
      scopeFunction.node.loc.start.line.should.equal(controllerTestData.scopeFunctions[index].line);
    });

    //thisProperties
    controller.thisProperties.should.have.length(controllerTestData.thisProperties.length);
    controller.thisProperties.forEach((thisProperty, index)=>{
      thisProperty.name.should.equal(controllerTestData.thisProperties[index].name);
      thisProperty.node.loc.start.line.should.equal(controllerTestData.thisProperties[index].line);
    });

    //thisFunctions
    controller.thisFunctions.should.have.length(controllerTestData.thisFunctions.length);
    controller.thisFunctions.forEach((thisFunction, index)=>{
      thisFunction.name.should.equal(controllerTestData.thisFunctions[index].name);
      thisFunction.node.loc.start.line.should.equal(controllerTestData.thisFunctions[index].line);
    });
  });
  done();
}

function testGlobalFunctions(globalFunctionsSemantics, globalFunctionsSemanticsTestData, done){
  globalFunctionsSemantics.should.have.length(globalFunctionsSemanticsTestData.length);
  globalFunctionsSemantics.forEach((globalFunction, index)=>{
    globalFunction.id.name.should.equal(globalFunctionsSemanticsTestData[index].name);
  });
  done();
}

function testServiceFiles(servicesSemantics, servicesSemanticsTestData, done){
  servicesSemantics.should.have.length(servicesSemanticsTestData.length);
  servicesSemantics.forEach((service, index)=>{

    var serviceTestData = servicesSemanticsTestData[index];
    service.name.should.equal(serviceTestData.name);

    //Check if service body is not object with properties.
    var returnId = service.returnStatement.argument.id;
    if (returnId) {
      returnId.name.should.equal(serviceTestData.returnStatement.argument.id.name);
      return;
    }

    //service properties
    var properties = service.returnStatement.argument.properties;
    var propertiesTestData = serviceTestData.returnStatement.argument.properties;
    properties.should.have.length(propertiesTestData.length);
    properties.forEach((scopeProperty, index)=>{
      scopeProperty.key.name.should.equal(propertiesTestData[index].key.name);
    });
  });
  done();
}
