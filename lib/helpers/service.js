/**
 * Created by marcochavezf on 9/4/16.
 */
var estraverse = require('estraverse');
var _ = require('lodash');
var fileHelper = require('./file');

module.exports = {
  appendServiceStructure: appendServiceStructure
};

function appendServiceStructure(services, globalFunctions){
  for (var i=0; i<services.length; i++){
    var serviceMeta = services[i];
    var serviceFunction = fileHelper.getBodyFunction(serviceMeta, globalFunctions);
    serviceMeta.function = serviceFunction;

    //Traverse service body
    //TODO: get returnBody (Check if it's just an identifier, then search for the object.
    //TODO: search for each returnBody property and append it to serviceMeta as 'properties'.
    estraverse.traverse(serviceFunction.body, { enter: enterBuildServiceStructure(serviceMeta) });
  }
}

function enterBuildServiceStructure(controller){

}

