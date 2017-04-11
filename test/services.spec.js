/**
 * Created by marcochavezf on 1/22/17.
 */
var chai = require('chai');
var should = chai.should();

var angularEsprimaFun = require('../lib');
var helperTest = require('./helpers');
var enableVerbose = false;

describe('Services', function(){
  it('should parse services (Angular Factories) from file.examples/testA (local files)', function (done) {
    this.timeout(5000);

    var dirTest = 'test/file.examples/testA';
    angularEsprimaFun.createProjectSemantics(dirTest, (projectSemantics)=>{
      var servicesSemantics = projectSemantics.servicesSemantics;
      var servicesSemanticsTestData = [
        //example1.js
        {
          name: 'serviceA',
          returnStatement: {
            argument: {
              id: { name: 'shinyNewServiceInstance' }
            }
          }
        },
        {
          name: 'serviceB',
          returnStatement: {
            argument: {
              properties: [
                { key: { name: 'sdfg' } },
                { key: { name: 'asdf' } },
                { key: { name: 'abc' } },
                { key: { name: 'bcd' } },
                { key: { name: 'xyz' } },
                { key: { name: 'chilli' } },
                { key: { name: 'anotherChilli' } },
                { key: { name: 'jalapeno' } }
              ]
            }
          }
        },
        //example2.js
        {
          name: 'nameService',
          returnStatement: {
            argument: {
              properties: [
                { key: { name: 'getData' } }
              ]
            }
          }
        }
      ];
      helperTest.testServiceFiles(servicesSemantics, servicesSemanticsTestData, done);
    }, enableVerbose);
  });

  it('should parse services (Angular Factories) from file.examples/testB (local files)', function (done) {
    this.timeout(5000);

    var dirTest = 'test/file.examples/testB';
    angularEsprimaFun.createProjectSemantics(dirTest, (projectSemantics)=>{
      var servicesSemantics = projectSemantics.servicesSemantics;
      var servicesSemanticsTestData = [
        //example1.js
        {
          name: 'UpdateFactory',
          returnStatement: {
            argument: {
              properties: [
                { key: { name: 'setEnvironment' } },
                { key: { name: 'check' } },
                { key: { name: 'performBinaryUpdate' } },
                { key: { name: 'performWebUpdate' } },
                { key: { name: 'performAppJsonUpdate' } }
              ]
            }
          }
        },
        {
          name: 'AppJsonUpdateFactory',
          returnStatement: {
            argument: {
              properties: [
                { key: { name: 'check' } },
                { key: { name: 'update' } }
              ]
            }
          }
        },
        {
          name: 'BinaryUpdateFactory',
          returnStatement: {
            argument: {
              properties: [
                { key: { name: 'currentVersion' } },
                { key: { name: 'latestBinaryVersion' } },
                { key: { name: 'check' } },
                { key: { name: 'update' } }
              ]
            }
          }
        },
        {
          name: 'WebUpdateFactory',
          returnStatement: {
            argument: {
              properties: [
                { key: { name: 'setEnvironment' } },
                { key: { name: 'check' } },
                { key: { name: 'watch' } },
                { key: { name: 'update' } }
              ]
            }
          }
        },
        //example2.js
        {
          name: 'AudioService',
          returnStatement: {
            argument: {
              properties: [
                { key: { name: 'playSound' } }
              ]
            }
          }
        },
        //example3.js
        {
          name: 'customStorage',
          returnStatement: {
            argument: {
              properties: [
                { key: { name: 'getUser' } },
                { key: { name: 'saveUser' } },
                { key: { name: 'removeUser' } },
                { key: { name: 'getModel' } },
                { key: { name: 'saveModel' } },
                { key: { name: 'resetModel' } },
                { key: { name: 'getToken' } },
                { key: { name: 'saveToken' } },
                { key: { name: 'removeToken' } }
              ]
            }
          }
        },
        //example1.js
        {
          name: 'MyService',
          returnStatement: {
            argument: {
              properties: [
                { key: { name: 'anotherFunction' } },
                { key: { name: 'sayHello' } }
              ]
            }
          }
        },
        //miscellaneous/example1.js
        {
          name: 'authRequestInterceptor',
          returnStatement: {
            argument: {
              properties: [
                { key: { name: 'request' } },
                { key: { name: 'responseError' } }
              ]
            }
          }
        },
        //example4.js
        {
          name: 'TaskActions',
          returnStatement: {
            argument: {
              properties: [
                { key: { name: 'buildMenu' } },
                { key: { name: 'buildNextView' } },
                { key: { name: 'cancelAutoPolling' } },
                { key: { name: 'createAddTaskAction' } },
                { key: { name: 'dataLoading' } },
                { key: { name: 'flushTasks' } },
                { key: { name: 'loadStoredReduxState' } },
                { key: { name: 'loadAndPrepareAllTasks' } },
                { key: { name: 'getLatestAfterSubmit' } },
                { key: { name: 'getCurrentState' } },
                { key: { name: 'getFilteredTasks' } },
                { key: { name: 'getUserTasks' } },
                { key: { name: 'pauseAutoPolling' } },
                { key: { name: 'populateMissingFieldValues' } },
                { key: { name: 'processUnsentTasks' } },
                { key: { name: 'removeTask' } },
                { key: { name: 'removeViews' } },
                { key: { name: 'setAutoPolling' } },
                { key: { name: 'subscribeUserTasks' } },
                { key: { name: 'stop' } },
                { key: { name: 'transformAllTasks' } },
                { key: { name: 'unsubscribeUserTasks' } },
                { key: { name: 'updateTasks' } }
              ]
            }
          }
        }
      ];
      helperTest.testServiceFiles(servicesSemantics, servicesSemanticsTestData, done);
    }, enableVerbose);
  });

  it('should parse services (Angular Service) from file.examples/testB/services/example5.js (local files)', function (done) {
    if (enableVerbose) {
      this.timeout(5000);
    }

    var dirTest = 'test/file.examples/testB/services/example5.js';
    angularEsprimaFun.createProjectSemantics(dirTest, (projectSemantics)=>{
      var servicesSemantics = projectSemantics.servicesSemantics;
      var servicesSemanticsTestData = [
        //example5.js
        {
          name: 'MyService',
          returnStatement: {
            argument: {
              properties: [
                { key: { name: 'anotherFunction' } },
                { key: { name: 'sayHello' } }
              ]
            }
          }
        }
      ];
      helperTest.testServiceFiles(servicesSemantics, servicesSemanticsTestData, done);
    }, enableVerbose);
  });
});
