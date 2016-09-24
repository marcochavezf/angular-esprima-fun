/**
 * Created by marcochavezf on 9/22/16.
 */

module.exports = {
  testControllerFiles: testControllerFiles
};

/////////////

function testControllerFiles(controllersFiles, controllersFilesTestData, done){
  controllersFiles.should.have.length(controllersFilesTestData.length);
  controllersFiles.forEach((controllerFile, index)=>{

    var controllers = controllerFile.controllerSemantic.controllers;
    var controllersData = controllersFilesTestData[index];

    controllers.should.have.length(controllersData.length);
    controllers.forEach((controller, index)=>{

      var controllerData = controllersData[index];
      controller.name.should.equal(controllerData.name);

      //scopeProperties
      controller.scopeProperties.should.have.length(controllerData.scopeProperties.length);
      controller.scopeProperties.forEach((scopeProperty, index)=>{
        scopeProperty.name.should.equal(controllerData.scopeProperties[index].name);
        scopeProperty.node.loc.start.line.should.equal(controllerData.scopeProperties[index].line);
      });

      //scopeFunctions
      controller.scopeFunctions.should.have.length(controllerData.scopeFunctions.length);
      controller.scopeFunctions.forEach((scopeFunction, index)=>{
        scopeFunction.name.should.equal(controllerData.scopeFunctions[index].name);
        scopeFunction.node.loc.start.line.should.equal(controllerData.scopeFunctions[index].line);
      });

      //thisProperties
      controller.thisProperties.should.have.length(controllerData.thisProperties.length);
      controller.thisProperties.forEach((thisProperty, index)=>{
        thisProperty.name.should.equal(controllerData.thisProperties[index].name);
        thisProperty.node.loc.start.line.should.equal(controllerData.thisProperties[index].line);
      });

      //thisFunctions
      controller.thisFunctions.should.have.length(controllerData.thisFunctions.length);
      controller.thisFunctions.forEach((thisFunction, index)=>{
        thisFunction.name.should.equal(controllerData.thisFunctions[index].name);
        thisFunction.node.loc.start.line.should.equal(controllerData.thisFunctions[index].line);
      });
    });
  });
  done();
}
