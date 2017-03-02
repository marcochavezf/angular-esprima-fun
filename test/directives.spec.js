/**
 * Created by marcochavezf on 1/22/17.
 */
var chai = require('chai');
var should = chai.should();
var _ = require('lodash');

var angularEsprimaFun = require('../lib');
var helperTest = require('./helpers');
var enableVerbose = false;

//TODO: add returnStatement properties to test
describe('Directives', function(){
  it('should parse directives from file.examples/testA (local files)', function (done) {
    if (enableVerbose) {
      this.timeout(5000);
    }

    var dirTest = 'test/file.examples/testA';
    angularEsprimaFun.createProjectSemantics(dirTest, (projectSemantics)=>{
      var directivesSemantics = projectSemantics.directivesSemantics;
      var directivesSemanticsTestData = [
        //example1.js
        {
          name: 'helloWorld',
          returnStatement: {
          }
        },
        //example2.js
        {
          name: 'helloWorld',
          returnStatement: {
          },
          link: {
            scopeProperties: [
              { name: 'color' }
            ],
            scopeFunctions: []
          }
        },
        //example3.js
        {
          name: 'notepad',
          returnStatement: {
          },
          link: {
            scopeProperties: [
              { name: 'editMode' },
              { name: 'noteText' },
              { name: 'index' },
              { name: 'notes' }
            ],
            scopeFunctions: [
              { name: 'openEditor' },
              { name: 'save' },
              { name: 'restore' }
            ]
          }
        }
      ];
      helperTest.testDirectiveFiles(directivesSemantics, directivesSemanticsTestData, done);
    }, enableVerbose);
  });


  it('should parse directives from file.examples/testB (local files)', function (done) {
    if (enableVerbose) {
      this.timeout(5000);
    }

    var dirTest = 'test/file.examples/testB';
    angularEsprimaFun.createProjectSemantics(dirTest, (projectSemantics)=>{
      var directivesSemantics = projectSemantics.directivesSemantics;
      var directivesSemanticsTestData = [
        //example1.js
        {
          name: 'ionDatetimePicker',
          returnStatement: {
          },
          controller: {
            scopeProperties: [
              { name: 'i18n' },
              { name: 'bind' },
              { name: 'rows' },
              { name: 'cols' },
              { name: 'weekdays' },
              { name: 'year' },
              { name: 'month' },
              { name: 'day' },
              { name: 'hour' },
              { name: 'minute' },
              { name: 'second' },
              { name: 'firstDay' },
              { name: 'daysInMonth' },
              { name: 'meridiem' },
              { name: 'today' }
            ],
            scopeFunctions: [
              { name: 'showPopup' },
              { name: 'prepare' },
              { name: 'processModel' },
              { name: 'changeBy' },
              { name: 'change' },
              { name: 'changeDay' },
              { name: 'isEnabled' },
              { name: 'changed' }
            ]
          },
          link: {
            scopeProperties: [
              { name: 'dateEnabled' },
              { name: 'timeEnabled' },
              { name: 'mondayFirst' },
              { name: 'secondsEnabled' },
              { name: 'meridiemEnabled' },
              { name: 'monthStep' },
              { name: 'hourStep' },
              { name: 'minuteStep' },
              { name: 'secondStep' },
              { name: 'modelDate' }
            ],
            scopeFunctions: [
              { name: 'commit' }
            ]
          }
        },
        //example2.js
        {
          name: 'searchBar',
          returnStatement: {
          },
          controller: {
            scopeProperties: [
              { name: 'search' },
              { name: 'showBar' },
              { name: 'showClearBtn' },
              { name: 'showSettingsBtn' },
              { name: 'searchPlaceholder' },
              { name: 'searchOption' },
              { name: 'loading' }
            ],
            scopeFunctions: [
              { name: 'clearSearch' },
              { name: 'toggleSearchBar' },
              { name: 'changeSearchSelect' }
            ]
          },
          compile: {
            link: {
              scopeProperties: [
                { name: 'navElement' }
              ],
              scopeFunctions: [ ]
            }
          }
        },
        //example3.js
        {
          name: 'arField',
          returnStatement: {
          },
          controller: {
            scopeProperties: [
              { name: 'debugTemplates' },
              { name: 'timePickerOptions' },
              { name: 'originalModelValue' },
              { name: 'bool' },
              { name: 'model' }
            ],
            scopeFunctions: [
              { name: 'isEditMode' },
              { name: 'cancelModal' },
              { name: 'saveModel' },
              { name: 'cancelHelperModal' },
              { name: 'saveHelperModel' },
              { name: 'getFieldLabel' },
              { name: 'getDateRange' },
              { name: 'hasValue' },
              { name: 'isReadOnly' },
              { name: 'filter' },
              { name: 'toggleBoolean' }
            ]
          },
          link: {
            scopeProperties: [
              { name: 'optionsListOrig' },
              { name: 'helperModal' },
              { name: 'modal' },
              { name: 'mapUrl' }
            ],
            scopeFunctions: [
              { name: 'openModalOrderItems' },
              { name: 'moveItemInDialog' }
            ]
          }
        }
      ];
      helperTest.testDirectiveFiles(directivesSemantics, directivesSemanticsTestData, done);
    }, enableVerbose);
  });
});
