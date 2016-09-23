/**
 * Created by marcochavezf on 9/8/16.
 */
module.exports = {
	printControllerFiles: printControllerFiles
};

function printControllerFiles(ctlrFilesParsed){

	ctlrFilesParsed.forEach((ctlrFileParsed) => {

		if (ctlrFileParsed.controllerSemantic.controllers.length) {
			console.log('\nStructure of ' + ctlrFileParsed.pathFile);
		}
		var controllerSemantic = ctlrFileParsed.controllerSemantic;
		controllerSemantic.controllers.forEach((controller) =>{
			console.log('*****', controller.name, 'BEGIN *****');

			if (controller.scopeProperties.length) {
				console.log('\n  $scope properties, total:', controller.scopeProperties.length);
				controller.scopeProperties.forEach((scopeProperty)=> {
					console.log('  - $scope.' + scopeProperty.name);
				});
			}

			if (controller.scopeFunctions.length) {
				console.log('\n  $scope functions, total: ', controller.scopeFunctions.length);
				controller.scopeFunctions.forEach((scopeFunction)=> {
					console.log('  - $scope.' + scopeFunction.name);
				});
			}

      if (controller.thisProperties.length) {
        console.log('\n  Total \'this\' properties: ', controller.thisProperties.length);
        controller.thisProperties.forEach((thisProperty)=> {
          console.log('  - this.' + thisProperty.name);
        });
      }

			if (controller.thisFunctions.length) {
				console.log('\n  Total \'this\' functions: ', controller.thisFunctions.length);
				controller.thisFunctions.forEach((thisFunction)=> {
					console.log('  - this.' + thisFunction.name);
				});
			}

			console.log('\n*****', controller.name, 'END *****');
		});

		controllerSemantic.globalVariables.forEach((globalVariable) =>{

		});

		controllerSemantic.globalFunctions.forEach((globalFunction) =>{

		});

	});
}
