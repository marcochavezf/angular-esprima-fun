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
        scopeProperty.name.should.equal(controllerData.scopeProperties[index]);
      });

      //scopeFunctions
      controller.scopeFunctions.should.have.length(controllerData.scopeFunctions.length);
      controller.scopeFunctions.forEach((scopeFunction, index)=>{
        scopeFunction.name.should.equal(controllerData.scopeFunctions[index]);
      });

      //thisProperties
      controller.thisProperties.should.have.length(controllerData.thisProperties.length);
      controller.thisProperties.forEach((thisProperty, index)=>{
        thisProperty.name.should.equal(controllerData.thisProperties[index]);
      });

      //thisFunctions
      controller.thisFunctions.should.have.length(controllerData.thisFunctions.length);
      controller.thisFunctions.forEach((thisFunction, index)=>{
        thisFunction.name.should.equal(controllerData.thisFunctions[index]);
      });
    });
  });
  done();
}
