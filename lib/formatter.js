/**
 * Created by marcochavezf on 9/8/16.
 */
module.exports = {
  printFilesParsed: printFilesParsed
};

function printFilesParsed(filesParsed){

  filesParsed.forEach((fileParsed) => {

    var fileSemantic = fileParsed.fileSemantic;
    console.log('\nStructure of ' + fileParsed.pathFile);

    fileSemantic.controllers.forEach((controller) =>{
			console.log('*****', controller.name, 'BEGIN *****');

			if (controller.scopeProperties.length) {
				console.log('\n  $scope properties, total:', controller.scopeProperties.length);
				controller.scopeProperties.forEach((scopeProperty)=> {
          var locStart = scopeProperty.node.loc.start;
					console.log('  - $scope.' + scopeProperty.name + '\t\tline ' + locStart.line + ':' + locStart.column);
				});
			}

			if (controller.scopeFunctions.length) {
				console.log('\n  $scope functions, total: ', controller.scopeFunctions.length);
				controller.scopeFunctions.forEach((scopeFunction)=> {
          var locStart = scopeFunction.node.loc.start;
          console.log('  - $scope.' + scopeFunction.name + '\t\tline ' + locStart.line + ':' + locStart.column);
				});
			}

      if (controller.thisProperties.length) {
        console.log('\n  Total \'this\' properties: ', controller.thisProperties.length);
        controller.thisProperties.forEach((thisProperty)=> {
          var locStart = thisProperty.node.loc.start;
          console.log('  - this.' + thisProperty.name + '\t\tline ' + locStart.line + ':' + locStart.column);
        });
      }

			if (controller.thisFunctions.length) {
				console.log('\n  Total \'this\' functions: ', controller.thisFunctions.length);
				controller.thisFunctions.forEach((thisFunction)=> {
          var locStart = thisFunction.node.loc.start;
          console.log('  - this.' + thisFunction.name + '\t\tline ' + locStart.line + ':' + locStart.column);
				});
			}

			console.log('\n*****', controller.name, 'END *****');
		});

		fileSemantic.globalVariables.forEach((globalVariable) =>{

		});

		fileSemantic.globalFunctions.forEach((globalFunction) =>{

		});

	});
}
